// Inline SVG placeholder — no external dependency, always works
const PLACEHOLDER_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='200' viewBox='0 0 280 200'%3E%3Crect width='280' height='200' fill='%23f0e6d3'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23a07850' font-family='sans-serif' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";

/**
 * Get the backend base URL (no /api suffix)
 */
const getBackendBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  return apiUrl.replace(/\/api\/?$/, '');
};

/**
 * Utility function to get the proper image URL
 * Handles both direct URLs and storage paths
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return PLACEHOLDER_SVG;
  }

  // If it's already a full URL, return it as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  const apiBaseUrl = getBackendBaseUrl();

  // If it starts with /storage/, prepend the backend base URL
  if (imagePath.startsWith('/storage/')) {
    return `${apiBaseUrl}${imagePath}`;
  }

  // If it starts with / but not /storage/, it's a local public asset
  if (imagePath.startsWith('/')) {
    return imagePath;
  }

  // If it starts with storage/ (without leading slash)
  if (imagePath.startsWith('storage/')) {
    return `${apiBaseUrl}/${imagePath}`;
  }

  // Check if it's a public folder image
  const publicImagePatterns = [
    'personalized-name-calligraphy-art.png',
    'custom-name-calligraphy-design.png',
    'anime-character-portrait-art.png',
    'anime-painting-watercolor-style.png',
    'islamic-calligraphy',
    'tote-bag',
    'ChatGPT Image',
    'nature-landscape'
  ];

  const isPublicImage = publicImagePatterns.some(pattern => imagePath.includes(pattern));

  if (isPublicImage) {
    return `/${imagePath}`;
  }

  // Otherwise, assume it's a path like 'artworks/filename.jpg'
  return `${apiBaseUrl}/storage/${imagePath}`;
};

/**
 * Get image URL with fallback
 * Uses image_url if available, otherwise constructs from image_path
 */
export const getArtworkImageUrl = (artwork) => {
  if (!artwork) {
    return PLACEHOLDER_SVG;
  }

  const apiBaseUrl = getBackendBaseUrl();

  // If image_url is already provided by the backend, use it
  if (artwork.image_url) {
    // Handle relative /storage/ paths (when backend APP_URL is localhost)
    if (artwork.image_url.startsWith('/storage/')) {
      return `${apiBaseUrl}${artwork.image_url}`;
    }
    return artwork.image_url;
  }

  // If artwork has image_path
  if (artwork.image_path) {
    // Check if image_path is already a full URL
    if (artwork.image_path.startsWith('http')) {
      return artwork.image_path;
    }
    // Construct full URL
    const cleanPath = artwork.image_path.replace(/^storage\//, '');
    return `${apiBaseUrl}/storage/${cleanPath}`;
  }

  // Fallback
  return PLACEHOLDER_SVG;
};

/**
 * Generate responsive image srcset for different screen sizes
 */
export const getResponsiveImageSrcSet = (imageUrl) => {
  if (!imageUrl || imageUrl.includes('placeholder')) {
    return '';
  }

  // For now, return the same image
  // In production, you'd generate different sizes on the backend
  return `${imageUrl} 1x, ${imageUrl} 2x`;
};

/**
 * Get optimized image URL with width and quality parameters
 * Works with image optimization services or backend processing
 */
export const getOptimizedImageUrl = (imageUrl, width = 800, quality = 80) => {
  if (!imageUrl || imageUrl.includes('placeholder')) {
    return imageUrl;
  }

  // If using a CDN or image optimization service, add query parameters
  // Example: Cloudinary, Imgix, etc.
  // For now, return original URL
  // TODO: Implement backend image optimization
  return imageUrl;
};

/**
 * Preload critical images for better performance
 */
export const preloadImage = (imageUrl) => {
  if (!imageUrl) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = imageUrl;
  document.head.appendChild(link);
};

/**
 * Lazy load image with Intersection Observer
 */
export const lazyLoadImage = (imgElement) => {
  if (!imgElement) return;

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute('data-src');
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          img.classList.add('loaded');
        }
        
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });

  imageObserver.observe(imgElement);
};

/**
 * Convert image format to WebP if supported
 */
export const supportsWebP = () => {
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
};

/**
 * Get image with WebP fallback
 */
export const getImageWithWebP = (imagePath) => {
  const imageUrl = getImageUrl(imagePath);
  
  if (supportsWebP() && !imageUrl.includes('.webp')) {
    // Try to get WebP version
    const webpUrl = imageUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    return webpUrl;
  }
  
  return imageUrl;
};

/**
 * Calculate image dimensions while maintaining aspect ratio
 */
export const calculateImageDimensions = (originalWidth, originalHeight, maxWidth, maxHeight) => {
  let width = originalWidth;
  let height = originalHeight;

  if (width > maxWidth) {
    height = (maxWidth / width) * height;
    width = maxWidth;
  }

  if (height > maxHeight) {
    width = (maxHeight / height) * width;
    height = maxHeight;
  }

  return { width: Math.round(width), height: Math.round(height) };
};


