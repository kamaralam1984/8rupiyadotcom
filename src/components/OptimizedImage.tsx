'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiShoppingBag } from 'react-icons/fi';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  placeholder?: 'blur' | 'empty';
  onError?: () => void;
  fallbackIcon?: React.ReactNode;
}

/**
 * Optimized Image Component
 * - Automatically converts JPEG/PNG to WebP/AVIF via Next.js Image
 * - Ensures images are optimized and compressed
 * - Fixes CLS by requiring dimensions
 * - Handles errors gracefully
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  sizes,
  objectFit = 'cover',
  placeholder = 'empty',
  onError,
  fallbackIcon,
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  // Get image dimensions if not provided (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined' && (!width || !height) && !fill && !hasError) {
      const img = new window.Image();
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        setHasError(true);
        onError?.();
      };
      img.src = src;
    }
  }, [src, width, height, fill, hasError, onError]);

  // Handle image error
  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Use provided dimensions or detected dimensions
  const finalWidth = width || imageDimensions?.width || 800;
  const finalHeight = height || imageDimensions?.height || 600;

  // If error, show fallback
  if (hasError) {
    return (
      <div
        className={`bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center ${className}`}
        style={fill ? { position: 'absolute', inset: 0 } : { width: finalWidth, height: finalHeight }}
      >
        {fallbackIcon || <FiShoppingBag className="text-6xl text-white opacity-50" />}
      </div>
    );
  }

  // If using fill, render with fill prop
  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={className}
        priority={priority}
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        style={{ objectFit }}
        onError={handleError}
        placeholder={placeholder}
        quality={85}
      />
    );
  }

  // Render with explicit dimensions (fixes CLS)
  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={finalWidth}
      height={finalHeight}
      className={className}
      priority={priority}
      sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
      style={{ objectFit }}
      onError={handleError}
      placeholder={placeholder}
      quality={85}
    />
  );
}

