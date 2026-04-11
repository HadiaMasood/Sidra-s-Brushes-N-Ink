// Resource hints for performance optimization

export const initResourceHints = () => {
  // Preconnect to API
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  document.head.appendChild(link);
};

export const prefetchOnHover = () => {
  // Add prefetch on hover for navigation links
  const links = document.querySelectorAll('a[href^="/"]');
  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      const href = link.getAttribute('href');
      if (href && !document.querySelector(`link[rel="prefetch"][href="${href}"]`)) {
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch';
        prefetchLink.href = href;
        document.head.appendChild(prefetchLink);
      }
    });
  });
};
