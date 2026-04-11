// Performance Optimization Utilities

// 1. Image Lazy Loading
export const lazyLoadImage = (imageUrl, placeholder = null) => {
  return {
    src: placeholder || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E',
    dataSrc: imageUrl,
    loading: 'lazy'
  };
};

// 2. Code Splitting - Dynamic Imports
export const dynamicImport = (path) => {
  return import(path);
};

// 3. Debounce function for search/filter
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// 4. Throttle function for scroll events
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 5. Intersection Observer for lazy loading
export const observeElement = (element, callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry);
        observer.unobserve(entry.target);
      }
    });
  }, defaultOptions);

  if (element) {
    observer.observe(element);
  }

  return observer;
};

// 6. Cache API responses
export const cacheResponse = (key, data, ttl = 3600000) => {
  const cacheData = {
    data,
    timestamp: Date.now(),
    ttl
  };
  localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
};

export const getCachedResponse = (key) => {
  const cached = localStorage.getItem(`cache_${key}`);
  if (!cached) return null;

  const { data, timestamp, ttl } = JSON.parse(cached);
  if (Date.now() - timestamp > ttl) {
    localStorage.removeItem(`cache_${key}`);
    return null;
  }

  return data;
};

// 7. Web Workers for heavy computations
export const createWorker = (workerScript) => {
  const blob = new Blob([workerScript], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);
  return new Worker(workerUrl);
};

// 8. Service Worker registration for PWA
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  }
};

// 9. Preload critical resources
export const preloadResource = (href, as = 'script') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = href;
  document.head.appendChild(link);
};

// 10. Prefetch resources
export const prefetchResource = (href) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
};

// 11. Monitor Core Web Vitals
export const monitorWebVitals = () => {
  // Largest Contentful Paint (LCP)
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('LCP:', entry.renderTime || entry.loadTime);
    }
  });
  observer.observe({ entryTypes: ['largest-contentful-paint'] });

  // First Input Delay (FID)
  const fidObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('FID:', entry.processingDuration);
    }
  });
  fidObserver.observe({ entryTypes: ['first-input'] });

  // Cumulative Layout Shift (CLS)
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        console.log('CLS:', clsValue);
      }
    }
  });
  clsObserver.observe({ entryTypes: ['layout-shift'] });
};

// 12. Optimize images
export const getOptimizedImageUrl = (url, width = 800, quality = 80) => {
  // For use with image optimization services like Cloudinary, Imgix, etc.
  // Example: https://res.cloudinary.com/demo/image/fetch/w_800,q_80/https://example.com/image.jpg
  return url; // Replace with actual optimization service
};

// 13. Minify CSS/JS (handled by build tool)
// 14. Gzip compression (handled by server)
// 15. CDN usage (handled by deployment)

export default {
  lazyLoadImage,
  dynamicImport,
  debounce,
  throttle,
  observeElement,
  cacheResponse,
  getCachedResponse,
  createWorker,
  registerServiceWorker,
  preloadResource,
  prefetchResource,
  monitorWebVitals,
  getOptimizedImageUrl
};
