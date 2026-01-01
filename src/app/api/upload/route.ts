import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

// Force Node.js runtime for Cloudinary operations
export const runtime = 'nodejs';

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

    // Upload to Cloudinary
    console.log('☁️  Uploading to Cloudinary...');
    let result;
    try {
      result = await uploadToCloudinary(buffer, '8rupiya-shops');
      console.log('✅ Cloudinary upload successful:', result.secureUrl);
    } catch (cloudinaryError: any) {
      console.error('❌ Cloudinary upload failed:', cloudinaryError);
      console.error('❌ Error details:', cloudinaryError.message);
      return NextResponse.json({ 
        error: `Cloudinary upload failed: ${cloudinaryError.message || 'Please check configuration'}`,
      }, { status: 500 });
    }

    console.log('✅ ===== UPLOAD SUCCESSFUL =====');
    console.log('✅ Storage: Cloudinary');
    console.log('✅ File URL:', result.secureUrl);
    console.log('✅ ===== END =====');

    return NextResponse.json({
      success: true,
      url: result.secureUrl,
      urls: [result.secureUrl],
      filename: result.publicId,
      storageType: 'cloudinary',
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

