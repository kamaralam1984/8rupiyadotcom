import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import sharp from 'sharp';

// Force Node.js runtime for Cloudinary operations
export const runtime = 'nodejs';

const MAX_SIZE_KB = 150; // 150KB max
const MAX_SIZE_BYTES = MAX_SIZE_KB * 1024;

/**
 * Optimize image: Convert to WebP/AVIF and compress to max 150KB
 */
async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  try {
    const metadata = await sharp(buffer).metadata();
    let outputBuffer: Buffer = Buffer.alloc(0);
    let quality = 85;

    // Try AVIF first (better compression)
    try {
      outputBuffer = await sharp(buffer)
        .resize(1920, 1920, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .avif({ quality })
        .toBuffer();

      // If AVIF is too large, try reducing quality
      if (outputBuffer.length > MAX_SIZE_BYTES) {
        for (quality = 80; quality >= 50 && outputBuffer.length > MAX_SIZE_BYTES; quality -= 10) {
          outputBuffer = await sharp(buffer)
            .resize(1920, 1920, {
              fit: 'inside',
              withoutEnlargement: true,
            })
            .avif({ quality })
            .toBuffer();
        }
      }

      // If still too large, fallback to WebP
      if (outputBuffer.length > MAX_SIZE_BYTES) {
        quality = 85;
        outputBuffer = await sharp(buffer)
          .resize(1920, 1920, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality })
          .toBuffer();
      }
    } catch (avifError) {
      // AVIF not supported, use WebP
      outputBuffer = await sharp(buffer)
        .resize(1920, 1920, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality })
        .toBuffer();
    }

    // Compress WebP if still too large
    if (outputBuffer.length > MAX_SIZE_BYTES) {
      for (quality = 80; quality >= 50 && outputBuffer.length > MAX_SIZE_BYTES; quality -= 10) {
        outputBuffer = await sharp(buffer)
          .resize(1920, 1920, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality })
          .toBuffer();
      }
    }

    // If still too large, reduce dimensions
    if (outputBuffer.length > MAX_SIZE_BYTES) {
      let width = 1600;
      let height = 1600;
      
      while (outputBuffer.length > MAX_SIZE_BYTES && width >= 800) {
        outputBuffer = await sharp(buffer)
          .resize(width, height, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 70 })
          .toBuffer();
        
        width -= 200;
        height -= 200;
      }
    }

    const sizeKB = (outputBuffer.length / 1024).toFixed(2);
    console.log(`✅ Image optimized: ${(buffer.length / 1024).toFixed(2)}KB → ${sizeKB}KB`);

    return Buffer.from(outputBuffer);
  } catch (error) {
    console.error('Image optimization error, using original:', error);
    return Buffer.from(buffer); // Return original if optimization fails
  }
}

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
    const originalBuffer = Buffer.from(bytes);
    console.log('✅ Buffer created:', originalBuffer.length, 'bytes');

    // Optimize image: Convert to WebP/AVIF and compress to max 150KB
    console.log('⚡ Optimizing image (converting to WebP/AVIF, max 150KB)...');
    const optimizedBuffer = await optimizeImage(originalBuffer);
    console.log('✅ Image optimized:', optimizedBuffer.length, 'bytes');

    // Upload to Cloudinary
    console.log('☁️  Uploading to Cloudinary...');
    let result;
    try {
      result = await uploadToCloudinary(optimizedBuffer, '8rupiya-shops');
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

