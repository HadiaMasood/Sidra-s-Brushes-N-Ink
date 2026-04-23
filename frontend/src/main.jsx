import './index.css';
import './test-api-url.js'; // Test API URL
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { setFullConfig } from './store/configSlice';
import { loadCartFromStorage } from './store/cartSlice';
import { HomePage } from './pages/Home';
import { GalleryPage } from './pages/Gallery';
import { CartPage } from './pages/Cart';
import { WishlistPage } from './pages/Wishlist';
import { ContactPage } from './pages/Contact';
import { CustomOrderPage } from './pages/CustomOrder';
import { AdminPanel } from './pages/Admin';
import { BlogPage } from './pages/Blog';
import { BlogPostPage } from './pages/BlogPost';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFound';
import { OrderSuccessPage } from './pages/OrderSuccess';
import { Header } from './components/Common';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { configService } from './services/api';
import AdminLogin from './components/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import { initResourceHints, prefetchOnHover } from './utils/resourceHints';
import { initPerformanceMonitoring } from './utils/performanceMonitor';

// Initialize performance optimizations
initResourceHints();
initPerformanceMonitoring();

const App = () => {
  const dispatch = useDispatch();
  const cartCount = useSelector(state => state.cart.items.length);
  const wishlistCount = useSelector(state => state.wishlist.items.length);

  useEffect(() => {
    // Always fetch fresh config from API on every page visit
    // localStorage provides instant initial render, API gives latest data
    const loadConfig = async () => {
      try {
        const config = await configService.getAll();
        if (config) {
          dispatch(setFullConfig(config));
        }
      } catch (error) {
        console.error('Error loading config:', error);
        // Silently fail - localStorage fallback will be used
      }
    };

    loadConfig();


    // Load cart from localStorage
    dispatch(loadCartFromStorage());

    // Initialize prefetch on hover after component mounts
    setTimeout(() => {
      prefetchOnHover();
    }, 1000);
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col">

      <Header cartCount={cartCount} wishlistCount={wishlistCount} />
      <main id="main-content" className="flex-1" role="main" aria-label="Main content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/gallery/:id" element={<GalleryPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about-us" element={<AboutPage />} />
          <Route path="/custom-orders" element={<CustomOrderPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/order-success/:id" element={<OrderSuccessPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppButton />
      <Toaster position="bottom-right" />
    </div>
  );
};

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);
