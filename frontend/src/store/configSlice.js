import { createSlice } from '@reduxjs/toolkit';

// Load initial state from localStorage
const loadConfigFromStorage = () => {
  try {
    const config = localStorage.getItem('siteConfig');
    if (config) {
      return JSON.parse(config);
    }
  } catch (error) {
    console.error('Error loading config:', error);
  }
  return {
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
      try {
        localStorage.setItem('siteConfig', JSON.stringify(merged));
      } catch (error) {
        console.error('Error saving config to localStorage:', error);
      }
      // Don't dispatch event here - let the caller handle it if needed
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
