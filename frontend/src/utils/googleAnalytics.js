// Google Analytics Integration for Admin Panel

// Initialize Google Analytics
export const initGA = (measurementId) => {
  if (typeof window === 'undefined') return;

  // Load gtag script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', measurementId);
};

// Track page view
export const trackPageView = (pagePath, pageTitle) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
};

// Track custom event
export const trackEvent = (eventName, eventParams = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

// Track e-commerce purchase
export const trackPurchase = (transactionId, value, items) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: 'PKR',
      items: items,
    });
  }
};

// Get real-time analytics data (mock for now - requires GA4 Data API)
export const getAnalyticsData = async (measurementId) => {
  // Note: This requires Google Analytics Data API setup
  // For now, returning mock data structure
  // In production, you'll need to:
  // 1. Enable Google Analytics Data API
  // 2. Create service account credentials
  // 3. Set up backend endpoint to fetch data securely
  
  return {
    realtime: {
      activeUsers: 0,
      screenPageViews: 0,
    },
    summary: {
      totalUsers: 0,
      newUsers: 0,
      sessions: 0,
      pageViews: 0,
      bounceRate: 0,
      avgSessionDuration: 0,
    },
    topPages: [],
    trafficSources: [],
    deviceCategory: {
      mobile: 0,
      desktop: 0,
      tablet: 0,
    },
  };
};

// Get GA data from window object (client-side only)
export const getGAClientData = () => {
  if (typeof window === 'undefined' || !window.gtag) {
    return null;
  }

  // This is a simplified version - actual implementation would need GA4 Measurement Protocol
  return {
    hasGA: true,
    dataLayer: window.dataLayer || [],
  };
};
