// Google Analytics 4 Setup
export const GA_TRACKING_ID = 'G-XXXXXXXXXX'; // Replace with your GA4 ID

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    // Load gtag script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_TRACKING_ID, {
      page_path: window.location.pathname,
    });
  }
};

// Track page views
export const trackPageView = (url) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Track events
export const trackEvent = (action, category, label, value) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// E-commerce tracking
export const trackAddToCart = (product) => {
  trackEvent('add_to_cart', 'ecommerce', product.title, product.price);
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'PKR',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.title,
        price: product.price,
        quantity: 1
      }]
    });
  }
};

export const trackPurchase = (orderId, total, items) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: orderId,
      value: total,
      currency: 'PKR',
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.title,
        price: item.price,
        quantity: item.quantity
      }))
    });
  }
};

export const trackSearch = (searchTerm) => {
  trackEvent('search', 'engagement', searchTerm);
};

export const trackViewItem = (product) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'PKR',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.title,
        price: product.price
      }]
    });
  }
};
