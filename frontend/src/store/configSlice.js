import { createSlice } from '@reduxjs/toolkit';

// Default config values
const DEFAULT_CONFIG = {
  branding: {
    brand_name: "Sidra's Brushes N Ink",
    brand_tagline: 'Authentic Art, Beautiful Expression',
    site_description: '',
    site_logo: null,
  },
  contact: {
    contact_email: 'hello@sidrabni.com',
    contact_phone: '+92 300 1234567',
    contact_address: 'Lahore, Pakistan',
  },
  social: {
    instagram_url: '',
    facebook_url: '',
    twitter_url: '',
    tiktok_url: '',
    whatsapp_url: '',
  },
  payment: {
    currency: 'PKR',
    currency_symbol: 'Rs.',
  }
};

// Load from localStorage ONLY for instant first render (avoids flash)
// main.jsx will ALWAYS fetch fresh config from API and overwrite this
const loadConfigFromStorage = () => {
  try {
    const config = localStorage.getItem('siteConfig');
    if (config) {
      const parsed = JSON.parse(config);
      // Merge with defaults to ensure all keys exist
      return {
        branding: { ...DEFAULT_CONFIG.branding, ...(parsed.branding || {}) },
        contact: { ...DEFAULT_CONFIG.contact, ...(parsed.contact || {}) },
        social: { ...DEFAULT_CONFIG.social, ...(parsed.social || {}) },
        payment: { ...DEFAULT_CONFIG.payment, ...(parsed.payment || {}) },
      };
    }
  } catch (error) {
    console.error('Error loading config from localStorage:', error);
  }
  return DEFAULT_CONFIG;
};

const configSlice = createSlice({
  name: 'config',
  initialState: loadConfigFromStorage(),
  reducers: {
    updateBranding: (state, action) => {
      state.branding = { ...state.branding, ...action.payload };
      // Save to localStorage
      localStorage.setItem('siteConfig', JSON.stringify(state));
    },
    updateContact: (state, action) => {
      state.contact = { ...state.contact, ...action.payload };
      localStorage.setItem('siteConfig', JSON.stringify(state));
    },
    updateSocial: (state, action) => {
      state.social = { ...state.social, ...action.payload };
      localStorage.setItem('siteConfig', JSON.stringify(state));
    },
    updatePayment: (state, action) => {
      state.payment = { ...state.payment, ...action.payload };
      localStorage.setItem('siteConfig', JSON.stringify(state));
    },
    setFullConfig: (state, action) => {
      const payload = action.payload || {};
      const merged = {
        branding: { ...state.branding, ...(payload.branding || {}) },
        contact: { ...state.contact, ...(payload.contact || {}) },
        social: { ...state.social, ...(payload.social || {}) },
        payment: { ...state.payment, ...(payload.payment || {}) },
      };
      // Always save fresh data to localStorage so next visit starts with latest
      try {
        localStorage.setItem('siteConfig', JSON.stringify(merged));
      } catch (error) {
        console.error('Error saving config to localStorage:', error);
      }
      return merged;
    },
  },
});

export const {
  updateBranding,
  updateContact,
  updateSocial,
  updatePayment,
  setFullConfig
} = configSlice.actions;

export default configSlice.reducer;

