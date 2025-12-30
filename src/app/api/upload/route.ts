import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { verifyToken } from '@/lib/auth';

// Force Node.js runtime for file system operations
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Get token from header or cookie
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || req.cookies.get('token')?.value;

    if (!token) {
      console.error('Upload: No token provided');
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
      formData = await req.formData();
    } catch (formError: any) {
      console.error('Upload: FormData parsing error:', formError);
      return NextResponse.json({ error: 'Failed to parse form data' }, { status: 400 });
    }

    // Get file from form data (try both 'image' and 'file' field names)
    const file = (formData.get('image') || formData.get('file')) as File;

    if (!file) {
      console.error('Upload: No file in form data');
      return NextResponse.json({ error: 'No file uploaded. Please select an image.' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${randomStr}.${extension}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir, { recursive: true });
        console.log('Created uploads directory:', uploadsDir);
      }
    } catch (dirError: any) {
      console.error('Upload: Directory creation error:', dirError);
      return NextResponse.json({ error: 'Failed to create upload directory' }, { status: 500 });
    }

    // Save file
    const filepath = join(uploadsDir, filename);
    try {
      await writeFile(filepath, buffer);
      console.log('File uploaded successfully:', filename);
    } catch (writeError: any) {
      console.error('Upload: File write error:', writeError);
      return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
    }

    // Return public URL
    const url = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url,
      urls: [url],
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: error.message || 'Upload failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

