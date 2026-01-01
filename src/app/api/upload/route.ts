import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { verifyToken } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

// Force Node.js runtime for file system operations
export const runtime = 'nodejs';

// Check if Cloudinary is configured
const USE_CLOUDINARY = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

export async function POST(req: NextRequest) {
  console.log('📤 ===== UPLOAD REQUEST STARTED =====');
  try {
    // Get token from header or cookie
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || req.cookies.get('token')?.value;

    console.log('🔑 Token present:', !!token);
    if (!token) {
      console.error('❌ Upload: No token provided');
      return NextResponse.json({ error: 'Unauthorized. Please login again.' }, { status: 401 });
    }

    // Verify token
    let payload;
    try {
      payload = verifyToken(token);
      if (!payload) {
        console.error('Upload: Invalid token');
        return NextResponse.json({ error: 'Invalid token. Please login again.' }, { status: 401 });
      }
    } catch (tokenError: any) {
      console.error('Upload: Token verification error:', tokenError);
      return NextResponse.json({ error: 'Token verification failed' }, { status: 401 });
    }

    // Get form data
    let formData;
    try {
      console.log('📦 Parsing form data...');
      formData = await req.formData();
      console.log('✅ Form data parsed');
    } catch (formError: any) {
      console.error('❌ Upload: FormData parsing error:', formError);
      return NextResponse.json({ error: 'Failed to parse form data' }, { status: 400 });
    }

    // Get file from form data (try both 'image' and 'file' field names)
    const file = (formData.get('image') || formData.get('file')) as File;

    if (!file) {
      console.error('❌ Upload: No file in form data');
      console.error('❌ Form data keys:', Array.from(formData.keys()));
      return NextResponse.json({ error: 'No file uploaded. Please select an image.' }, { status: 400 });
    }

    console.log('📸 File received:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('❌ Invalid file type:', file.type);
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.error('❌ File too large:', file.size);
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    console.log('🔄 Converting file to buffer...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('✅ Buffer created:', buffer.length, 'bytes');

    let url: string;
    let filename: string;

    // Use Cloudinary if configured, otherwise use local storage
    if (USE_CLOUDINARY) {
      console.log('☁️  Using Cloudinary for upload...');
      try {
        const result = await uploadToCloudinary(buffer, '8rupiya-shops');
        url = result.secureUrl;
        filename = result.publicId;
        console.log('✅ Cloudinary upload successful:', url);
      } catch (cloudinaryError: any) {
        console.error('❌ Cloudinary upload failed:', cloudinaryError);
        return NextResponse.json({ 
          error: `Cloudinary upload failed: ${cloudinaryError.message || 'Unknown error'}`,
        }, { status: 500 });
      }
    } else {
      console.log('💾 Using local storage (Cloudinary not configured)...');
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop() || 'jpg';
      filename = `${timestamp}-${randomStr}.${extension}`;

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      console.log('📁 Uploads directory:', uploadsDir);
      console.log('📁 Current working directory:', process.cwd());
      
      try {
        if (!existsSync(uploadsDir)) {
          console.log('⚠️  Directory does not exist, creating...');
          mkdirSync(uploadsDir, { recursive: true });
          console.log('✅ Created uploads directory:', uploadsDir);
        } else {
          console.log('✅ Directory already exists');
        }
      } catch (dirError: any) {
        console.error('❌ Upload: Directory creation error:', dirError);
        return NextResponse.json({ error: 'Failed to create upload directory' }, { status: 500 });
      }

      // Save file
      const filepath = join(uploadsDir, filename);
      try {
        console.log('📝 Attempting to write file:', filepath);
        console.log('📊 Buffer size:', buffer.length, 'bytes');
        await writeFile(filepath, buffer);
        console.log('✅ File uploaded successfully:', filename);
        
        // Verify file was created
        if (existsSync(filepath)) {
          console.log('✅ File verified on disk:', filepath);
        } else {
          console.error('❌ File not found after write:', filepath);
        }
      } catch (writeError: any) {
        console.error('❌ Upload: File write error:', writeError);
        console.error('❌ Error code:', writeError.code);
        console.error('❌ Error message:', writeError.message);
        console.error('❌ File path:', filepath);
        console.error('❌ Uploads dir:', uploadsDir);
        console.error('❌ Full error:', writeError);
        return NextResponse.json({ 
          error: `Failed to save file: ${writeError.message || 'Unknown error'}`,
          details: writeError.code || 'WRITE_ERROR'
        }, { status: 500 });
      }

      // Return public URL
      url = `/uploads/${filename}`;
    }

    console.log('✅ ===== UPLOAD SUCCESSFUL =====');
    console.log('✅ Storage type:', USE_CLOUDINARY ? 'Cloudinary' : 'Local');
    console.log('✅ File URL:', url);
    console.log('✅ ===== END =====');

    return NextResponse.json({
      success: true,
      url,
      urls: [url],
      filename,
      storageType: USE_CLOUDINARY ? 'cloudinary' : 'local',
    });
  } catch (error: any) {
    console.error('❌ ===== UPLOAD FAILED =====');
    console.error('❌ Upload error:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ ===== END =====');
    return NextResponse.json({ 
      error: error.message || 'Upload failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

