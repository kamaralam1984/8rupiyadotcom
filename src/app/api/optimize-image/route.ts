import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

// Force Node.js runtime for Sharp operations
export const runtime = 'nodejs';

const MAX_SIZE_KB = 150; // 150KB max
const MAX_SIZE_BYTES = MAX_SIZE_KB * 1024;

/**
 * Optimize image: Convert to WebP/AVIF and compress to max 150KB
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get image metadata
    const metadata = await sharp(buffer).metadata();
    const originalFormat = metadata.format;

    // Determine output format (prefer AVIF, fallback to WebP)
    let outputFormat: 'avif' | 'webp' = 'webp';
    let quality = 85;
    let outputBuffer: Buffer;

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
        outputFormat = 'webp';
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
      outputFormat = 'webp';
      outputBuffer = await sharp(buffer)
        .resize(1920, 1920, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality })
        .toBuffer();
    }

    // Compress WebP if still too large
    if (outputFormat === 'webp' && outputBuffer.length > MAX_SIZE_BYTES) {
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

    // Get optimized image metadata
    const optimizedMetadata = await sharp(outputBuffer).metadata();
    const sizeKB = (outputBuffer.length / 1024).toFixed(2);

    return NextResponse.json({
      success: true,
      buffer: outputBuffer.toString('base64'),
      format: outputFormat,
      size: outputBuffer.length,
      sizeKB: parseFloat(sizeKB),
      width: optimizedMetadata.width,
      height: optimizedMetadata.height,
      originalFormat,
      originalSize: buffer.length,
      compressionRatio: ((1 - outputBuffer.length / buffer.length) * 100).toFixed(1),
    });
  } catch (error: any) {
    console.error('Image optimization error:', error);
    return NextResponse.json(
      { error: error.message || 'Image optimization failed' },
      { status: 500 }
    );
  }
}

