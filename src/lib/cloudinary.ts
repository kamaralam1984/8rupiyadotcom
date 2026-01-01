import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image buffer to Cloudinary
 * @param buffer - Image buffer
 * @param folder - Cloudinary folder (default: '8rupiya-shops')
 * @returns Promise with Cloudinary upload result
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = '8rupiya-shops'
): Promise<{ url: string; publicId: string; secureUrl: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit', quality: 'auto:good' },
        ],
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          reject(error);
        } else if (result) {
          console.log('✅ Cloudinary upload successful:', result.secure_url);
          resolve({
            url: result.url,
            publicId: result.public_id,
            secureUrl: result.secure_url,
          });
        } else {
          reject(new Error('No result from Cloudinary'));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Delete image from Cloudinary
 * @param publicId - Cloudinary public ID
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('🗑️  Cloudinary delete result:', result);
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
    throw error;
  }
}

export default cloudinary;

