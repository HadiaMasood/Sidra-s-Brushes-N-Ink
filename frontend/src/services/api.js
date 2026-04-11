import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

console.log('API Service initialized');
console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);
console.log('Final API_URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  // Support multiple possible storage keys for the token
  const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken') || localStorage.getItem('token');

  console.log('API Request:', config.method?.toUpperCase(), config.url);
  console.log('Token found in localStorage:', !!token);
  // Don't attach Authorization header for login endpoints
  const urlPath = (config.url || '').toString();
  if (urlPath.includes('/auth/login') || urlPath.includes('/admin/login')) {
    console.log('Skipping Authorization header for login request to', config.url);
    // Ensure any existing Authorization header is removed for login
    delete config.headers.Authorization;
    // Let other headers and body proceed
    // Don't set Content-Type here for FormData; handled below
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  }

  if (token) {
    // Normalize token string (strip possible JSON wrappers)
    let t = token;
    try {
      // some parts of the app may store a JSON string like '{"token":"..."}'
      const parsed = JSON.parse(token);
      if (parsed && typeof parsed === 'object' && (parsed.token || parsed.access_token)) {
        t = parsed.token || parsed.access_token;
      }
    } catch (e) {
      // not JSON, ignore
    }

    config.headers.Authorization = `Bearer ${t}`;
    console.log('Authorization header set');
  } else {
    console.log('No auth token present - request will be unauthenticated');
  }

  // Don't set Content-Type for multipart/form-data - let browser set it
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => {
    console.log('Axios interceptor - Raw response:', response);
    console.log('Axios interceptor - Response data:', response.data);
    console.log('Axios interceptor - Data type:', typeof response.data);

    // Return the response data as-is
    // Let the calling code handle the structure (paginated vs array vs object)
    console.log('Axios interceptor - Returning data as-is');
    return response.data || {};
  },
  (error) => {
    console.error('Axios interceptor - API Error:', error);
    console.error('Axios interceptor - Error response:', error.response?.data);

    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ ARTWORKS ============
export const artworkService = {
  // Accepts params and an optional options object (e.g., { signal })
  getAll: (params, options = {}) => api.get('/artworks', { params, ...options }),
  getById: (id, options = {}) => api.get(`/artworks/${id}`, { ...options }),
  create: (data) => api.post('/artworks', data),
  update: (id, data) => {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return api.post(`/artworks/${id}`, data);
    }
    return api.put(`/artworks/${id}`, data);
  },
  delete: (id) => api.delete(`/artworks/${id}`),
};

// ============ IMAGES ============
export const imageService = {
  getAll: (artworkId) => api.get(`/artworks/${artworkId}/images`),
  getById: (artworkId, imageId) => api.get(`/artworks/${artworkId}/images/${imageId}`),
  upload: (artworkId, formData) => api.post(`/artworks/${artworkId}/images`, formData),
  update: (artworkId, imageId, data) => api.put(`/artworks/${artworkId}/images/${imageId}`, data),
  delete: (artworkId, imageId) => api.delete(`/artworks/${artworkId}/images/${imageId}`),
  reorder: (artworkId, images) => api.post(`/artworks/${artworkId}/images/reorder`, { images }),
};

// ============ CATEGORIES ============
export const categoryService = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// ============ REVIEWS ============
export const reviewService = {
  getByArtwork: (artworkId) => api.get(`/reviews/artwork/${artworkId}`),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  approve: (id) => api.post(`/reviews/${id}/approve`),
  reject: (id) => api.post(`/reviews/${id}/reject`),
  getPending: () => api.get('/reviews/pending'),
  // Admin methods
  adminGetAll: (params) => api.get('/admin/reviews', { params }),
  adminUpdate: (id, data) => api.put(`/admin/reviews/${id}`, data),
  adminDelete: (id) => api.delete(`/admin/reviews/${id}`),
};

// ============ ORDERS ============
export const orderService = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// ============ PAYMENTS ============
export const paymentService = {
  initiateEasypaisa: (data) => api.post('/payment/easypaisa', data),
  initiateJazzcash: (data) => api.post('/payment/jazzcash', data),
  getStatus: (id) => api.get(`/payment/${id}`),
};

// ============ CONTACT ============
export const contactService = {
  submit: (data) => api.post('/contact', data),
  getAll: () => api.get('/contact'),
  getById: (id) => api.get(`/contact/${id}`),
  delete: (id) => api.delete(`/contact/${id}`),
  reply: (id, message) => api.post(`/contact/${id}/reply`, { message }),
};

// ============ CUSTOM ORDERS ============
export const customOrderService = {
  getAll: () => api.get('/custom-orders'),
  getById: (id) => api.get(`/custom-orders/${id}`),
  create: (data) => api.post('/custom-orders', data),
  updateStatus: (id, status) => api.put(`/custom-orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/custom-orders/${id}`),
};

// ============ CONFIGURATION ============
export const configService = {
  getAll: () => api.get('/admin/config/all'),
  getByKey: (key) => api.get(`/config/${key}`),
  // Use public logo endpoint by default so header and public pages can load without admin auth
  getLogo: () => api.get('/config/logo'),
  getPublicLogo: () => api.get('/config/logo'),
  update: (data) => api.put('/config', data),
  updateBrand: (data) => api.post('/admin/config/brand', data),
  updateContact: (data) => api.post('/admin/config/contact', data),
  updateSocial: (data) => api.post('/admin/config/social-links', data),
  updatePayment: (data) => api.post('/admin/config/payment', data),
  uploadLogo: (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post('/config/logo', formData);
  },
};

// ============ ANALYTICS ============
export const analyticsService = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getRevenue: (period = 'monthly') => api.get('/analytics/revenue', { params: { period } }),
  getOrders: () => api.get('/analytics/orders'),
  getArtworks: () => api.get('/analytics/artworks'),
  getReviews: () => api.get('/analytics/reviews'),
  exportData: async () => {
    // For blob responses, we need to bypass the interceptor
    const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken') || localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/analytics/export`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      responseType: 'blob',
    });
    return response.data;
  },
};

// ============ AUTHENTICATION ============
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  logout: () => {
    localStorage.removeItem('auth_token');
    return Promise.resolve();
  },
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// ============ BLOG ============
export const blogService = {
  getAll: (params) => api.get('/blog', { params }),
  getBySlug: (slug) => api.get(`/blog/${slug}`),
  getCategories: () => api.get('/blog/categories'),
  create: (data) => api.post('/blog', data),
  update: (id, data) => api.put(`/blog/${id}`, data),
  delete: (id) => api.delete(`/blog/${id}`),
};

export default api;
