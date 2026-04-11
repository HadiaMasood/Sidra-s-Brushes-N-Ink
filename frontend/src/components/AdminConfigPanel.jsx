import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setFullConfig, updateBranding } from '../store/configSlice';
import api from '../services/api';
import { getArtworkImageUrl } from '../utils/imageUtils';
import './AdminConfigPanel.css';

const AdminConfigPanel = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('branding');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Artwork Upload
  const [artworkTitle, setArtworkTitle] = useState('');
  const [artworkDescription, setArtworkDescription] = useState('');
  const [artworkPrice, setArtworkPrice] = useState('');
  const [artworkCategory, setArtworkCategory] = useState('');
  const [artworkImage, setArtworkImage] = useState(null);
  const [artworkImagePreview, setArtworkImagePreview] = useState('');
  const [artworkFeatured, setArtworkFeatured] = useState(false);
  const [artworks, setArtworks] = useState([]);
  const [editingArtwork, setEditingArtwork] = useState(null);

  // Branding
  const [brandName, setBrandName] = useState('');
  const [brandTagline, setBrandTagline] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  // Payment
  const [currency, setCurrency] = useState('PKR');
  const [currencySymbol, setCurrencySymbol] = useState('₨');
  const [easypaisaMerchantId, setEasypaisaMerchantId] = useState('');
  const [easypaisaApiKey, setEasypaisaApiKey] = useState('');
  const [jazzcashMerchantId, setJazzcashMerchantId] = useState('');
  const [jazzcashApiKey, setJazzcashApiKey] = useState('');

  // Social Links
  const [socialLinks, setSocialLinks] = useState({
    instagram_url: '',
    instagram_id: '',
    facebook_url: '',
    facebook_id: '',
    twitter_url: '',
    linkedin_url: '',
    youtube_url: '',
    tiktok_url: '',
  });

  // Contact Info
  const [contactInfo, setContactInfo] = useState({
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    contact_city: '',
    contact_country: '',
    business_hours: '',
  });

  // Social Feeds
  const [socialFeeds, setSocialFeeds] = useState([]);
  const [feedsLoading, setFeedsLoading] = useState(false);

  // Reviews Management
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('pending');

  // Dashboard Stats
  const [stats, setStats] = useState({});

  useEffect(() => {
    console.log('=== AdminConfigPanel MOUNTED ===');
    // Load config first (required), then load stats in background (optional)
    loadConfig();

    console.log('Calling loadArtworks...');
    loadArtworks().then(() => {
      console.log('loadArtworks completed');
    }).catch(err => {
      console.error('loadArtworks failed:', err);
    });

    // Load stats separately without blocking UI
    loadStatsInBackground();
  }, []);

  const loadConfig = async () => {
    try {
      console.log('Loading configuration...');
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');

      if (!token) {
        console.warn('No token found');
        return;
      }

      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const configUrl = `${apiBase}/admin/config/all`;

      // Use fetch instead of axios for faster loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(configUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('Config request failed with status:', response.status);
        setMessage('Error loading configuration');
        return;
      }

      const config = await response.json();
      console.log('Configuration loaded successfully');

      // Update Redux store with full config
      dispatch(setFullConfig(config));

      // Set branding
      if (config.branding) {
        setBrandName(config.branding.brand_name || '');
        setBrandTagline(config.branding.brand_tagline || '');
        if (config.branding.site_logo) {
          const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
          setLogoPreview(`${backendUrl}/storage/${config.branding.site_logo}`);
        }
      }

      // Set payment
      if (config.payment) {
        setCurrency(config.payment.currency || 'PKR');
        setCurrencySymbol(config.payment.currency_symbol || '₨');
        setEasypaisaMerchantId(config.payment.easypaisa_merchant_id || '');
        setEasypaisaApiKey(config.payment.easypaisa_api_key || '');
        setJazzcashMerchantId(config.payment.jazzcash_merchant_id || '');
        setJazzcashApiKey(config.payment.jazzcash_api_key || '');
      }

      // Set social
      if (config.social) {
        setSocialLinks(prev => ({ ...prev, ...config.social }));
      }

      // Set contact
      if (config.contact) {
        setContactInfo(prev => ({ ...prev, ...config.contact }));
      }
    } catch (error) {
      console.error('Error loading configuration:', error.message);
      setMessage('Error loading configuration');
    }
  };

  // Load stats in background without blocking UI
  const loadStatsInBackground = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');

      if (!token) {
        return;
      }

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout (shorter for bg task)

      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const statsUrl = `${apiBase}/admin/config/dashboard-stats`;

      const response = await fetch(statsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn('Stats endpoint returned status:', response.status);
        setStats({});
        return;
      }

      const data = await response.json();
      console.log('Stats loaded');
      setStats(data);
    } catch (error) {
      // Silently fail - stats are optional for dashboard functionality
      console.warn('Could not load dashboard stats:', error.message);
      // Set default empty stats so UI doesn't break
      setStats({});
    }
  };

  const loadArtworks = async () => {
    try {
      console.log('=== LOADING ARTWORKS ===');
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');

      if (!token) {
        console.log('No token found');
        return;
      }

      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const timestamp = Date.now();
      const artworksUrl = `${apiBase}/artworks?all=true&_=${timestamp}`;

      console.log('Fetching artworks from:', artworksUrl);

      const response = await fetch(artworksUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Artworks loaded:', responseData);

        const artworksArray = Array.isArray(responseData) ? responseData : (responseData.data || []);

        console.log(`📦 Loaded ${artworksArray.length} artworks`);

        // Log each artwork's image info
        artworksArray.forEach((art, idx) => {
          console.log(`Artwork ${idx + 1} [ID: ${art.id}]:`, {
            title: art.title,
            image_path: art.image_path,
            image_url: art.image_url,
            updated_at: art.updated_at
          });
        });

        // Force state update with new array reference
        setArtworks([...artworksArray]);

        console.log('✅ Artworks state updated');
      } else {
        console.error('Failed to load artworks:', response.status);
        setArtworks([]);
      }
    } catch (error) {
      console.error('Error loading artworks:', error);
      setArtworks([]);
    }
  };

  const deleteArtwork = async (artworkId) => {
    if (!window.confirm('Are you sure you want to delete this artwork?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');

      if (!token) {
        setMessage('Not authenticated');
        return;
      }

      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const deleteUrl = `${apiBase}/artworks/${artworkId}`;

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage('✅ Artwork deleted successfully!');
        await loadArtworks();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error deleting artwork');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
    }
  };

  const handleArtworkImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArtworkImage(file);
      const preview = URL.createObjectURL(file);
      setArtworkImagePreview(preview);
    }
  };

  const updateArtwork = async () => {
    if (!editingArtwork) {
      return;
    }

    try {
      setLoading(true);
      setMessage('⏳ Updating artwork...');

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');

      if (!token) {
        setMessage('❌ Not authenticated');
        return;
      }

      console.log('=== UPDATING ARTWORK ===');
      console.log('Artwork ID:', editingArtwork.id);
      console.log('Has new image:', !!artworkImage);
      if (artworkImage) {
        console.log('New image file:', artworkImage.name, artworkImage.size, 'bytes');
      }

      const formData = new FormData();
      formData.append('_method', 'PUT');

      // Add all fields
      if (editingArtwork.title) formData.append('title', editingArtwork.title);
      if (editingArtwork.description) formData.append('description', editingArtwork.description);
      if (editingArtwork.price) formData.append('price', editingArtwork.price);
      if (editingArtwork.category) formData.append('category', editingArtwork.category);
      if (editingArtwork.dimensions) formData.append('dimensions', editingArtwork.dimensions);
      if (editingArtwork.medium) formData.append('medium', editingArtwork.medium);
      if (editingArtwork.artist) formData.append('artist', editingArtwork.artist);
      if (editingArtwork.year_created) formData.append('year_created', editingArtwork.year_created);
      if (editingArtwork.stock_quantity !== undefined) formData.append('stock_quantity', editingArtwork.stock_quantity);

      formData.append('featured', editingArtwork.featured ? '1' : '0');
      formData.append('active', editingArtwork.active ? '1' : '0');

      // Add new image if selected
      if (artworkImage) {
        formData.append('image', artworkImage);
        console.log('✅ Image added to FormData');
      }

      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const updateUrl = `${apiBase}/artworks/${editingArtwork.id}`;

      console.log('📤 Sending update to:', updateUrl);

      const response = await fetch(updateUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json();
      console.log('📥 Update response:', responseData);

      if (response.ok) {
        console.log('✅ Update successful!');
        setMessage('✅ Artwork updated! Refreshing gallery...');

        // Close modal first
        setEditingArtwork(null);
        setArtworkImage(null);
        setArtworkImagePreview('');

        // Wait a moment for file system to sync
        await new Promise(resolve => setTimeout(resolve, 800));

        // Force reload artworks
        console.log('🔄 Reloading artworks...');
        await loadArtworks();

        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('artworkUpdated', {
          detail: {
            id: editingArtwork.id,
            data: responseData.data,
            timestamp: Date.now()
          }
        }));

        setMessage('✅ Gallery refreshed successfully!');
        setTimeout(() => setMessage(''), 3000);

        console.log('✅ Update complete!');
      } else {
        console.error('❌ Update failed:', responseData);
        setMessage(`❌ Error: ${responseData.message || 'Failed to update artwork'}`);
      }
    } catch (error) {
      console.error('❌ Update error:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const uploadLogo = async () => {
    if (!logo) {
      setMessage('Please select a logo image');
      return;
    }

    try {
      setLoading(true);
      setMessage('Uploading logo...');

      console.log('=== LOGO UPLOAD START ===');
      console.log('Logo file:', logo);
      console.log('Logo name:', logo.name);
      console.log('Logo size:', logo.size);
      console.log('Logo type:', logo.type);

      const formData = new FormData();
      formData.append('logo', logo);

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      console.log('Token present:', !!token);

      if (!token) {
        setMessage('Not authenticated. Please log in first.');
        setLoading(false);
        return;
      }

      console.log('Sending upload request...');
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const uploadUrl = `${apiBase}/admin/config/upload-logo`;
      console.log('Upload URL:', uploadUrl);

      // Use raw fetch for file upload to avoid axios issues with FormData
      // Add timeout to prevent hanging indefinitely
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('Upload timeout - aborting request after 30 seconds');
        controller.abort();
      }, 30000);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Response received. Status:', response.status);
      console.log('Response type:', response.type);

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed. Status:', response.status);
        console.error('Error response:', errorText);
        setMessage(`Error uploading logo: HTTP ${response.status} - ${errorText}`);
        setLoading(false);
        return;
      }

      // Parse response as JSON
      let responseData;
      try {
        const responseText = await response.text();
        console.log('Raw response text:', responseText);

        if (!responseText) {
          console.warn('Empty response text');
          responseData = {};
        } else {
          responseData = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        setMessage('Upload may have succeeded but response parsing failed');
        setLoading(false);
        return;
      }

      console.log('=== LOGO UPLOAD SUCCESS ===');
      console.log('Response data:', responseData);
      console.log('Response keys:', Object.keys(responseData || {}));
      console.log('Response.message:', responseData?.message);
      console.log('Response.logo_path:', responseData?.logo_path);
      console.log('Response.logo_url:', responseData?.logo_url);

      // Check if upload was successful
      if (responseData && (responseData.message || responseData.logo_path)) {
        console.log('✅ Upload successful, updating state...');

        // Get the logo path from response
        const logoPath = responseData.logo_path || responseData.logo_url;
        console.log('Logo path:', logoPath);

        // Update Redux store with new logo immediately
        if (logoPath) {
          const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
          let finalLogoUrl = logoPath;

          if (!logoPath.startsWith('http') && !logoPath.startsWith('data:')) {
            finalLogoUrl = `${backendUrl}/storage/${logoPath}`;
          }

          console.log('Final logo URL:', finalLogoUrl);

          // Update Redux state
          dispatch(updateBranding({ site_logo: logoPath }));
          console.log('✅ Redux store updated with logo');
        }

        setMessage('✅ Logo uploaded successfully!');
        setLogo(null);
        setLogoPreview('');

        // Reload configuration to get updated logo
        console.log('Reloading configuration...');
        await loadConfig();
        console.log('✅ Configuration reloaded');

        // Trigger a custom event to notify other components
        console.log('Dispatching configUpdated event...');
        window.dispatchEvent(new CustomEvent('configUpdated'));

        console.log('✅ Logo upload complete!');
        setTimeout(() => setMessage(''), 5000);
      } else {
        console.warn('⚠️ Upload response missing expected data');
        setMessage('⚠️ Upload may have succeeded but response was unexpected');
      }

      setLoading(false);
    } catch (error) {
      console.error('=== LOGO UPLOAD ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      let errorMsg = error.message || 'Unknown error';

      // Handle AbortError from timeout
      if (error.name === 'AbortError') {
        errorMsg = 'Upload timeout - server may be slow or not responding. Please try again.';
      }

      setMessage(`❌ Error uploading logo: ${errorMsg}`);
      setLoading(false);
    }
  };

  const uploadArtwork = async () => {
    if (!artworkTitle || !artworkDescription || !artworkPrice || !artworkImage) {
      setMessage('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', artworkTitle);
      formData.append('description', artworkDescription);
      formData.append('price', artworkPrice);
      formData.append('category', artworkCategory);
      formData.append('featured', artworkFeatured);
      formData.append('image', artworkImage);

      await api.post('/artworks', formData);

      setMessage('Artwork uploaded successfully!');
      setArtworkTitle('');
      setArtworkDescription('');
      setArtworkPrice('');
      setArtworkCategory('');
      setArtworkImage(null);
      setArtworkImagePreview('');
      setArtworkFeatured(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error uploading artwork');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveBrandSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (!token) {
        setMessage('Not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      console.log('=== SAVING BRAND SETTINGS ===');
      console.log('Brand name:', brandName);
      console.log('Brand tagline:', brandTagline);
      console.log('Token present:', !!token);

      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const saveUrl = `${apiBase}/admin/config/brand`;
      console.log('Save URL:', saveUrl);

      // Use fetch instead of axios for better control
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('Save timeout - aborting request after 30 seconds');
        controller.abort();
      }, 30000);

      const response = await fetch(saveUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          brand_name: brandName,
          brand_tagline: brandTagline,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Response received. Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Save failed. Status:', response.status);
        console.error('Error response:', errorText);
        setMessage(`Error saving brand settings: HTTP ${response.status}`);
        setLoading(false);
        return;
      }

      // Parse response
      let responseData;
      try {
        const responseText = await response.text();
        console.log('Raw response text:', responseText);

        if (!responseText) {
          responseData = {};
        } else {
          responseData = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        setMessage('Save may have succeeded but response parsing failed');
        setLoading(false);
        return;
      }

      console.log('=== BRAND SAVE SUCCESS ===');
      console.log('Response data:', responseData);

      // Update Redux store immediately
      const brandData = {
        brand_name: brandName,
        brand_tagline: brandTagline
      };
      dispatch(updateBranding(brandData));
      console.log('✅ Redux store updated');

      setMessage('✅ Brand settings saved successfully!');

      // Reload configuration from API
      console.log('Reloading configuration from API...');
      await loadConfig();
      console.log('✅ Configuration reloaded');

      // Dispatch custom event to notify all components
      window.dispatchEvent(new CustomEvent('configUpdated'));
      console.log('✅ configUpdated event dispatched');

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('=== BRAND SAVE ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);

      let errorMsg = `Error saving brand settings: ${error.message}`;

      if (error.name === 'AbortError') {
        errorMsg = 'Save timeout - server may be slow or not responding. Please try again.';
      }

      console.error(errorMsg);
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const savePaymentSettings = async () => {
    try {
      setLoading(true);
      await api.post('/admin/config/payment', {
        currency,
        currency_symbol: currencySymbol,
        easypaisa_merchant_id: easypaisaMerchantId,
        easypaisa_api_key: easypaisaApiKey,
        jazzcash_merchant_id: jazzcashMerchantId,
        jazzcash_api_key: jazzcashApiKey,
      });
      setMessage('Payment settings saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving payment settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSocialLinks = async () => {
    try {
      setLoading(true);
      await api.post('/admin/config/social-links', socialLinks);
      setMessage('Social links saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving social links');
    } finally {
      setLoading(false);
    }
  };

  const saveContactInfo = async () => {
    try {
      setLoading(true);
      await api.post('/admin/config/contact', contactInfo);
      setMessage('Contact information saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving contact information');
    } finally {
      setLoading(false);
    }
  };

  const syncSocialFeeds = async () => {
    try {
      setFeedsLoading(true);
      await api.post('/admin/config/sync-social', {});
      setMessage('Social feeds synced successfully!');
      loadSocialFeeds();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error syncing social feeds');
    } finally {
      setFeedsLoading(false);
    }
  };

  const loadSocialFeeds = async () => {
    try {
      setFeedsLoading(true);
      const response = await api.get('/admin/config/social-feeds');
      setSocialFeeds(response || []);
    } catch (error) {
      console.error('Error loading social feeds:', error);
    } finally {
      setFeedsLoading(false);
    }
  };

  const loadReviews = async (status) => {
    try {
      setReviewsLoading(true);
      const response = await api.get(`/admin/reviews?status=${status}`);
      setReviews(response.data || response || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const updateReviewStatus = async (reviewId, status) => {
    try {
      await api.put(`/admin/reviews/${reviewId}`, { status });
      loadReviews(reviewFilter);
      setMessage('Review updated!');
    } catch (error) {
      setMessage('Error updating review');
    }
  };

  const deleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await api.delete(`/admin/reviews/${reviewId}`);
        loadReviews(reviewFilter);
        setMessage('Review deleted!');
      } catch (error) {
        setMessage('Error deleting review');
      }
    }
  };

  return (
    <div className="admin-config-panel">
      <div className="config-header">
        <h1>Admin Configuration Panel</h1>
        {message && <div className={`alert ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}
      </div>

      <div className="config-stats">
        <div className="stat-box">
          <h3>{stats.total_reviews || 0}</h3>
          <p>Total Reviews</p>
        </div>
        <div className="stat-box">
          <h3>{stats.pending_reviews || 0}</h3>
          <p>Pending Reviews</p>
        </div>
        <div className="stat-box">
          <h3>{stats.instagram_posts || 0}</h3>
          <p>Instagram Posts</p>
        </div>
        <div className="stat-box">
          <h3>{stats.facebook_posts || 0}</h3>
          <p>Facebook Posts</p>
        </div>
      </div>

      <div className="config-tabs">
        <button
          className={`tab ${activeTab === 'branding' ? 'active' : ''}`}
          onClick={() => setActiveTab('branding')}
        >
          Branding
        </button>
        <button
          className={`tab ${activeTab === 'artwork' ? 'active' : ''}`}
          onClick={() => setActiveTab('artwork')}
        >
          Upload Artwork
        </button>
        <button
          className={`tab ${activeTab === 'artworks' ? 'active' : ''}`}
          onClick={() => setActiveTab('artworks')}
        >
          Manage Artworks
        </button>
        <button
          className={`tab ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          Payment
        </button>
        <button
          className={`tab ${activeTab === 'social' ? 'active' : ''}`}
          onClick={() => setActiveTab('social')}
        >
          Social Media
        </button>
        <button
          className={`tab ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          Contact Info
        </button>
        <button
          className={`tab ${activeTab === 'feeds' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('feeds');
            loadSocialFeeds();
          }}
        >
          Social Feeds
        </button>
        <button
          className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('reviews');
            loadReviews('pending');
          }}
        >
          Reviews
        </button>
      </div>

      <div className="config-content">
        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className="tab-content">
            <h2>Branding Settings</h2>
            <div className="form-group">
              <label>Brand Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Enter brand name"
              />
            </div>
            <div className="form-group">
              <label>Brand Tagline</label>
              <textarea
                value={brandTagline}
                onChange={(e) => setBrandTagline(e.target.value)}
                placeholder="Enter brand tagline"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Site Logo</label>
              {logoPreview && (
                <div className="logo-preview">
                  <img src={logoPreview} alt="Logo preview" />
                </div>
              )}
              <input type="file" onChange={handleLogoChange} accept="image/*" />
              {logo && (
                <button onClick={uploadLogo} disabled={loading} className="btn btn-primary">
                  Upload Logo
                </button>
              )}
            </div>
            <button onClick={saveBrandSettings} disabled={loading} className="btn btn-primary">
              Save Brand Settings
            </button>
          </div>
        )}

        {/* Artwork Upload Tab */}
        {activeTab === 'artwork' && (
          <div className="tab-content">
            <h2>Upload New Artwork</h2>
            <div className="form-group">
              <label>Artwork Title *</label>
              <input
                type="text"
                value={artworkTitle}
                onChange={(e) => setArtworkTitle(e.target.value)}
                placeholder="Enter artwork title"
              />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={artworkDescription}
                onChange={(e) => setArtworkDescription(e.target.value)}
                placeholder="Enter artwork description"
                rows="4"
              />
            </div>
            <div className="form-group">
              <label>Price (Rs.) *</label>
              <input
                type="number"
                value={artworkPrice}
                onChange={(e) => setArtworkPrice(e.target.value)}
                placeholder="Enter price"
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={artworkCategory}
                onChange={(e) => setArtworkCategory(e.target.value)}
                placeholder="e.g., Abstract, Landscape, Portrait"
              />
            </div>
            <div className="form-group">
              <label>Artwork Image *</label>
              {artworkImagePreview && (
                <div className="logo-preview">
                  <img src={artworkImagePreview} alt="Artwork preview" />
                </div>
              )}
              <input
                type="file"
                onChange={handleArtworkImageChange}
                accept="image/*"
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={artworkFeatured}
                  onChange={(e) => setArtworkFeatured(e.target.checked)}
                />
                Featured Artwork
              </label>
            </div>
            <button onClick={uploadArtwork} disabled={loading} className="btn btn-primary">
              {loading ? 'Uploading...' : 'Upload Artwork'}
            </button>
          </div>
        )}

        {/* Artworks List Tab */}
        {activeTab === 'artworks' && (
          <div className="tab-content">
            <h2>Manage Artworks</h2>
            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={loadArtworks}
                style={{
                  padding: '10px 20px',
                  background: '#C5A059',
                  color: '#1C1C1C',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🔄 Refresh Artworks
              </button>
            </div>
            {artworks.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '40px', background: '#f9f9f9', borderRadius: '4px' }}>
                No artworks uploaded yet. Upload artworks from the "Upload Artwork" tab.
              </p>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <p style={{ color: '#666', margin: 0 }}>Total Artworks: {artworks.length}</p>
                  <button
                    onClick={() => {
                      console.log('=== CURRENT ARTWORKS STATE ===');
                      console.log('Artworks array:', artworks);
                      artworks.forEach((art, idx) => {
                        console.log(`Artwork ${idx + 1}:`, {
                          id: art.id,
                          title: art.title,
                          image_path: art.image_path,
                          image_url: art.image_url,
                          has_image_url: !!art.image_url
                        });
                      });
                    }}
                    style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    🐛 Debug Artworks
                  </button>
                </div>
                <div className="artworks-grid">
                  {artworks.map((artwork) => {
                    // Create unique key that changes when artwork updates
                    const imageKey = `${artwork.id}-${artwork.updated_at || Date.now()}-${artwork.image_path || ''}`;
                    const imageUrl = artwork.image_url || getArtworkImageUrl(artwork);
                    const cacheBustedUrl = imageUrl ? `${imageUrl}?t=${Date.now()}` : null;

                    console.log(`Rendering artwork ${artwork.id}:`, { imageUrl, cacheBustedUrl });

                    return (
                      <div key={`artwork-card-${imageKey}`} className="artwork-card">
                        <div className="artwork-image">
                          {cacheBustedUrl ? (
                            <img
                              key={imageKey} // CRITICAL: Force image re-render
                              src={cacheBustedUrl}
                              alt={artwork.title}
                              loading="lazy"
                              decoding="async"
                              onLoad={(e) => {
                                console.log(`✅ Image loaded for artwork ${artwork.id}:`, e.target.src);
                              }}
                              onError={(e) => {
                                console.error(`❌ Image failed for artwork ${artwork.id}:`, e.target.src);
                                e.target.src = 'https://via.placeholder.com/280x200?text=Image+Not+Found';
                              }}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#f0f0f0',
                              color: '#999'
                            }}>
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="artwork-info">
                          <h3>{artwork.title}</h3>
                          <p className="description">{artwork.description?.substring(0, 80) || 'No description'}...</p>
                          <p className="price">Rs. {artwork.price || 'N/A'}</p>
                          {artwork.category && <p className="category">Category: {artwork.category}</p>}
                          {artwork.featured && <span className="featured-badge">Featured</span>}
                        </div>
                        <div className="artwork-actions">
                          <button
                            className="btn btn-edit"
                            onClick={() => {
                              console.log('Opening edit modal for:', artwork);
                              setEditingArtwork({ ...artwork }); // Create new object reference
                              setArtworkImage(null);
                              setArtworkImagePreview('');
                            }}
                            title="Edit artwork"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-delete"
                            onClick={() => deleteArtwork(artwork.id)}
                            disabled={loading}
                            title="Delete artwork"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <div className="tab-content">
            <h2>Payment Settings</h2>
            <div className="form-group">
              <label>Currency Code</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="PKR">PKR (Pakistani Rupee)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="AED">AED (UAE Dirham)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Currency Symbol</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="₨"
              />
            </div>

            <h3>Easypaisa Settings</h3>
            <div className="form-group">
              <label>Merchant ID</label>
              <input
                type="text"
                value={easypaisaMerchantId}
                onChange={(e) => setEasypaisaMerchantId(e.target.value)}
                placeholder="Enter Easypaisa Merchant ID"
              />
            </div>
            <div className="form-group">
              <label>API Key</label>
              <input
                type="password"
                value={easypaisaApiKey}
                onChange={(e) => setEasypaisaApiKey(e.target.value)}
                placeholder="Enter Easypaisa API Key"
              />
            </div>


            <h3>JazzCash Settings</h3>
            <div className="form-group">
              <label>Merchant ID</label>
              <input
                type="text"
                value={jazzcashMerchantId}
                onChange={(e) => setJazzcashMerchantId(e.target.value)}
                placeholder="Enter JazzCash Merchant ID"
              />
            </div>
            <div className="form-group">
              <label>API Key</label>
              <input
                type="password"
                value={jazzcashApiKey}
                onChange={(e) => setJazzcashApiKey(e.target.value)}
                placeholder="Enter JazzCash API Key"
              />
            </div>


            <button onClick={savePaymentSettings} disabled={loading} className="btn btn-primary">
              Save Payment Settings
            </button>
          </div>
        )}

        {/* Social Links Tab */}
        {activeTab === 'social' && (
          <div className="tab-content">
            <h2>Social Media Links</h2>
            <div className="form-group">
              <label>Instagram URL</label>
              <input
                type="url"
                value={socialLinks.instagram_url}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram_url: e.target.value })}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="form-group">
              <label>Instagram Business Account ID</label>
              <input
                type="text"
                value={socialLinks.instagram_id}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram_id: e.target.value })}
                placeholder="Instagram Business Account ID"
              />
            </div>

            <div className="form-group">
              <label>Facebook URL</label>
              <input
                type="url"
                value={socialLinks.facebook_url}
                onChange={(e) => setSocialLinks({ ...socialLinks, facebook_url: e.target.value })}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="form-group">
              <label>Facebook Page ID</label>
              <input
                type="text"
                value={socialLinks.facebook_id}
                onChange={(e) => setSocialLinks({ ...socialLinks, facebook_id: e.target.value })}
                placeholder="Facebook Page ID"
              />
            </div>

            <div className="form-group">
              <label>Twitter URL</label>
              <input
                type="url"
                value={socialLinks.twitter_url}
                onChange={(e) => setSocialLinks({ ...socialLinks, twitter_url: e.target.value })}
                placeholder="https://twitter.com/..."
              />
            </div>
            <div className="form-group">
              <label>LinkedIn URL</label>
              <input
                type="url"
                value={socialLinks.linkedin_url}
                onChange={(e) => setSocialLinks({ ...socialLinks, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/..."
              />
            </div>
            <div className="form-group">
              <label>YouTube URL</label>
              <input
                type="url"
                value={socialLinks.youtube_url}
                onChange={(e) => setSocialLinks({ ...socialLinks, youtube_url: e.target.value })}
                placeholder="https://youtube.com/..."
              />
            </div>
            <div className="form-group">
              <label>TikTok URL</label>
              <input
                type="url"
                value={socialLinks.tiktok_url}
                onChange={(e) => setSocialLinks({ ...socialLinks, tiktok_url: e.target.value })}
                placeholder="https://tiktok.com/..."
              />
            </div>

            <button onClick={saveSocialLinks} disabled={loading} className="btn btn-primary">
              Save Social Links
            </button>
          </div>
        )}

        {/* Contact Info Tab */}
        {activeTab === 'contact' && (
          <div className="tab-content">
            <h2>Contact Information</h2>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={contactInfo.contact_email}
                onChange={(e) => setContactInfo({ ...contactInfo, contact_email: e.target.value })}
                placeholder="contact@example.com"
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={contactInfo.contact_phone}
                onChange={(e) => setContactInfo({ ...contactInfo, contact_phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={contactInfo.contact_address}
                onChange={(e) => setContactInfo({ ...contactInfo, contact_address: e.target.value })}
                placeholder="Street address"
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={contactInfo.contact_city}
                onChange={(e) => setContactInfo({ ...contactInfo, contact_city: e.target.value })}
                placeholder="City"
              />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                value={contactInfo.contact_country}
                onChange={(e) => setContactInfo({ ...contactInfo, contact_country: e.target.value })}
                placeholder="Country"
              />
            </div>
            <div className="form-group">
              <label>Business Hours</label>
              <textarea
                value={contactInfo.business_hours}
                onChange={(e) => setContactInfo({ ...contactInfo, business_hours: e.target.value })}
                placeholder="Mon-Fri: 9AM-5PM"
                rows="3"
              />
            </div>

            <button onClick={saveContactInfo} disabled={loading} className="btn btn-primary">
              Save Contact Information
            </button>
          </div>
        )}

        {/* Social Feeds Tab */}
        {activeTab === 'feeds' && (
          <div className="tab-content">
            <h2>Social Media Feeds</h2>
            <button onClick={syncSocialFeeds} disabled={feedsLoading} className="btn btn-primary">
              {feedsLoading ? 'Syncing...' : 'Sync Social Feeds'}
            </button>

            <div className="feeds-list">
              {socialFeeds.map((feed) => (
                <div key={feed.id} className="feed-card">
                  <div className="feed-header">
                    <span className="platform-badge">{feed.platform.toUpperCase()}</span>
                    <span className="feed-date">{new Date(feed.posted_at).toLocaleDateString()}</span>
                  </div>
                  <p className="feed-content">{feed.content}</p>
                  {feed.metadata?.media_url && (
                    <img src={feed.metadata.media_url} alt="Post" className="feed-image" />
                  )}
                  <div className="feed-stats">
                    <span>❤️ {feed.likes}</span>
                    <span>💬 {feed.comments_count}</span>
                  </div>
                  {feed.comments && feed.comments.length > 0 && (
                    <div className="feed-comments">
                      <h4>Comments:</h4>
                      {feed.comments.slice(0, 3).map((comment, idx) => (
                        <div key={idx} className="comment">
                          <strong>{comment.username}</strong>: {comment.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="tab-content">
            <h2>Review Management</h2>
            <div className="review-filters">
              <button
                className={`filter-btn ${reviewFilter === 'pending' ? 'active' : ''}`}
                onClick={() => {
                  setReviewFilter('pending');
                  loadReviews('pending');
                }}
              >
                Pending
              </button>
              <button
                className={`filter-btn ${reviewFilter === 'approved' ? 'active' : ''}`}
                onClick={() => {
                  setReviewFilter('approved');
                  loadReviews('approved');
                }}
              >
                Approved
              </button>
              <button
                className={`filter-btn ${reviewFilter === 'rejected' ? 'active' : ''}`}
                onClick={() => {
                  setReviewFilter('rejected');
                  loadReviews('rejected');
                }}
              >
                Rejected
              </button>
            </div>

            {reviewsLoading ? (
              <p>Loading reviews...</p>
            ) : (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <h4>{review.title}</h4>
                      <div className="review-rating">
                        {'⭐'.repeat(review.rating)}
                      </div>
                    </div>
                    <p className="review-author">By: {review.customer_name}</p>
                    <p className="review-comment">{review.comment}</p>
                    <div className="review-actions">
                      {reviewFilter === 'pending' && (
                        <>
                          <button
                            className="btn btn-success"
                            onClick={() => updateReviewStatus(review.id, 'approved')}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => updateReviewStatus(review.id, 'rejected')}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        className="btn btn-delete"
                        onClick={() => deleteReview(review.id)}
                      >
                        Delete
                      </button>
                      {reviewFilter === 'approved' && (
                        <button
                          className="btn btn-feature"
                          onClick={() => updateReviewStatus(review.id, 'featured')}
                        >
                          {review.is_featured ? 'Unfeature' : 'Feature'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Edit Artwork Modal */}
        {editingArtwork && (
          <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div className="modal-content" style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h2 style={{ margin: 0 }}>Edit Artwork</h2>
                <button
                  onClick={() => {
                    setEditingArtwork(null);
                    setArtworkImage(null);
                    setArtworkImagePreview('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: 0,
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>

              <div className="form-group">
                <label>Artwork Title *</label>
                <input
                  type="text"
                  value={editingArtwork.title || ''}
                  onChange={(e) => {
                    console.log('Title changed to:', e.target.value);
                    setEditingArtwork({ ...editingArtwork, title: e.target.value });
                  }}
                  placeholder="Enter artwork title"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={editingArtwork.description || ''}
                  onChange={(e) => setEditingArtwork({ ...editingArtwork, description: e.target.value })}
                  placeholder="Enter artwork description"
                  rows="4"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>

              <div className="form-group">
                <label>Price (Rs.) *</label>
                <input
                  type="number"
                  value={editingArtwork.price || ''}
                  onChange={(e) => setEditingArtwork({ ...editingArtwork, price: e.target.value })}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={editingArtwork.category || ''}
                  onChange={(e) => setEditingArtwork({ ...editingArtwork, category: e.target.value })}
                  placeholder="e.g., Abstract, Landscape"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>

              <div className="form-group">
                <label>Dimensions</label>
                <input
                  type="text"
                  value={editingArtwork.dimensions || ''}
                  onChange={(e) => setEditingArtwork({ ...editingArtwork, dimensions: e.target.value })}
                  placeholder="e.g., 24x36 inches"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>

              <div className="form-group">
                <label>Medium</label>
                <input
                  type="text"
                  value={editingArtwork.medium || ''}
                  onChange={(e) => setEditingArtwork({ ...editingArtwork, medium: e.target.value })}
                  placeholder="e.g., Oil on Canvas"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>

              <div className="form-group">
                <label>Artist</label>
                <input
                  type="text"
                  value={editingArtwork.artist || ''}
                  onChange={(e) => setEditingArtwork({ ...editingArtwork, artist: e.target.value })}
                  placeholder="Artist name"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>

              <div className="form-group">
                <label>Year Created</label>
                <input
                  type="number"
                  value={editingArtwork.year_created || ''}
                  onChange={(e) => setEditingArtwork({ ...editingArtwork, year_created: e.target.value })}
                  placeholder="YYYY"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>

              <div className="form-group">
                <label>Stock Quantity</label>
                <input
                  type="number"
                  value={editingArtwork.stock_quantity || ''}
                  onChange={(e) => setEditingArtwork({ ...editingArtwork, stock_quantity: e.target.value })}
                  placeholder="0"
                  min="0"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>

              <div className="form-group">
                <label>Artwork Image</label>
                <div style={{ marginBottom: '10px' }}>
                  {artworkImagePreview ? (
                    // Show NEW image preview
                    <img
                      src={artworkImagePreview}
                      alt="New preview"
                      style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                      key={artworkImagePreview} // Force re-render with key
                    />
                  ) : editingArtwork.image_url ? (
                    // Show EXISTING image with cache-busting
                    <img
                      src={`${editingArtwork.image_url}?t=${Date.now()}`}
                      alt={editingArtwork.title}
                      style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                      onError={(e) => {
                        console.error('Image load error:', e);
                        e.target.src = 'https://via.placeholder.com/280x200?text=Image+Not+Found';
                      }}
                      key={editingArtwork.image_url} // Force re-render with key
                    />
                  ) : (
                    <div style={{
                      padding: '40px',
                      background: '#f0f0f0',
                      borderRadius: '4px',
                      textAlign: 'center',
                      color: '#999'
                    }}>
                      No Image
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      console.log('New image selected:', file.name);
                      setArtworkImage(file);
                      const preview = URL.createObjectURL(file);
                      setArtworkImagePreview(preview);
                    }
                  }}
                  accept="image/*"
                  style={{ width: '100%' }}
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  {artworkImage ? `Selected: ${artworkImage.name}` : 'Choose a new image to replace the current one'}
                </p>
              </div>

              <div className="form-group" style={{ display: 'flex', gap: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={editingArtwork.active || false}
                    onChange={(e) => setEditingArtwork({ ...editingArtwork, active: e.target.checked })}
                  />
                  <span>Active (Show in Gallery)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={editingArtwork.featured || false}
                    onChange={(e) => setEditingArtwork({ ...editingArtwork, featured: e.target.checked })}
                  />
                  <span>Featured</span>
                </label>
              </div>

              <div style={{
                display: 'flex',
                gap: '10px',
                marginTop: '20px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => {
                    setEditingArtwork(null);
                    setArtworkImage(null);
                    setArtworkImagePreview('');
                  }}
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={updateArtwork}
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    background: '#C5A059',
                    color: '#1C1C1C',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminConfigPanel;
