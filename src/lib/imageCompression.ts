/**
 * Compress image to target size (default 1MB)
 * @param file - Image file to compress
 * @param maxSizeMB - Maximum size in MB (default 1MB)
 * @param maxWidth - Maximum width in pixels (default 1920)
 * @param maxHeight - Maximum height in pixels (default 1920)
 * @returns Compressed image as Blob
 */
export async function compressImage(
  file: File,
  maxSizeMB: number = 1,
  maxWidth: number = 1920,
  maxHeight: number = 1920
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw image with new dimensions
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with quality adjustment
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        let quality = 0.9;
        let compressedBlob: Blob | null = null;

        const compress = (): void => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              // If size is acceptable or quality is too low, return
              if (blob.size <= maxSizeBytes || quality <= 0.1) {
                resolve(blob);
                return;
              }

              // Reduce quality and try again
              quality -= 0.1;
              compress();
            },
            'image/jpeg',
            quality
          );
        };

        compress();
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
}

/**
 * Convert blob to File
 */
export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: 'image/jpeg' });
}

