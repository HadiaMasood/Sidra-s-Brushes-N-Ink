// Performance monitoring utilities

export const initPerformanceMonitoring = () => {
  if (typeof window === 'undefined') return;

  // Monitor page load performance
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      
      if (import.meta.env.DEV) {
        console.log('Page Load Time:', pageLoadTime + 'ms');
      }
    }, 0);
  });
};
