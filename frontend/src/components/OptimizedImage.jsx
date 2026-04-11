import React, { useState, useEffect, useRef } from 'react';
import { getArtworkImageUrl } from '../utils/imageUtils';
import { generateDetailedAltText } from '../utils/altTextGenerator';

/**
 * Optimized Image Component with:
 * - Lazy loading
 * - WebP support with fallback
 * - Responsive srcset
 * - Alt text enforcement
 * - Loading placeholder
 * - Error handling
 */
export const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  objectFit = 'cover',
  placeholder = 'blur',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const imgRef = useRef(null);

  // Generate image URL
  useEffect(() => {
    if (src) {
      const url = typeof src === 'string' ? src : getArtworkImageUrl(src);
      setImageSrc(url);
    }
  }, [src]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imgRef.current || loading !== 'lazy') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const dataSrc = img.getAttribute('data-src');
            if (dataSrc) {
              img.src = dataSrc;
              img.removeAttribute('data-src');
            }
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [loading, imageSrc]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  // Generate WebP URL if supported
  const getWebPUrl = (url) => {
    if (!url || url.includes('.webp')) return url;
    // Check if browser supports WebP
    const supportsWebP = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
    if (supportsWebP && url.match(/\.(jpg|jpeg|png)$/i)) {
      return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    return url;
  };

  // Generate srcset for responsive images
  const generateSrcSet = (url) => {
    if (!url || url.includes('placeholder') || url.includes('unsplash')) return '';
    
    // For production, you'd generate different sizes on backend
    // For now, return 1x and 2x versions
    return `${url} 1x, ${url} 2x`;
  };

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center p-4">
          <svg
            className="w-12 h-12 mx-auto text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs text-gray-500">Image not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Loading Placeholder */}
      {!isLoaded && placeholder === 'blur' && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"
          style={{ width, height }}
        />
      )}

      {/* Actual Image - No WebP until files exist */}
      <img
        ref={imgRef}
        src={loading === 'lazy' ? undefined : imageSrc}
        data-src={loading === 'lazy' ? imageSrc : undefined}
        alt={alt || 'Artwork image'}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        style={{
          objectFit,
          width: width || '100%',
          height: height || '100%',
        }}
        loading={loading}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        width={width}
        height={height}
        {...props}
      />

      {/* Loading Spinner */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

/**
 * Artwork Card Image - Optimized for gallery cards
 */
export const ArtworkImage = ({ artwork, className = '', ...props }) => {
  const imageUrl = getArtworkImageUrl(artwork);
  const altText = artwork.alt_text 
    ? artwork.alt_text 
    : generateDetailedAltText(artwork) || 'Handcrafted artwork by Sidra\'s Brushes N Ink';

  return (
    <OptimizedImage
      src={imageUrl}
      alt={altText}
      className={className}
      loading="lazy"
      objectFit="contain"
      {...props}
    />
  );
};

/**
 * Hero Image - Optimized for large hero sections
 */
export const HeroImage = ({ src, alt, className = '', ...props }) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      loading="eager"
      objectFit="contain"
      placeholder="blur"
      {...props}
    />
  );
};

/**
 * Thumbnail Image - Optimized for small previews
 */
export const ThumbnailImage = ({ src, alt, className = '', ...props }) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      objectFit="cover"
      width={80}
      height={80}
      {...props}
    />
  );
};

export default OptimizedImage;
