import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { artworkService, configService, orderService, analyticsService, reviewService, contactService, customOrderService } from '../services/api';
import api from '../services/api';
import { ArtworkForm } from '../components/Forms';
import toast from 'react-hot-toast';
import { setFullConfig, updateBranding } from '../store/configSlice';
import { getArtworkImageUrl, getImageUrl } from '../utils/imageUtils';

export const AdminPanel = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const config = useSelector(state => state.config);
  const siteName = config.branding?.brand_name || "Sidra's Brushes N Ink";
  const [activeTab, setActiveTab] = useState('dashboard');
  const [artworks, setArtworks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [brandName, setBrandName] = useState('');
  const [brandTagline, setBrandTagline] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [brandSaving, setBrandSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalArtworks: 0, totalOrders: 0, totalRevenue: 0 });
  const [filter, setFilter] = useState({ status: 'all', category: 'all' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('all'); // all, pending, approved, rejected
  const [reviewStats, setReviewStats] = useState({ total: 0, pending: 0, approved: 0, featured: 0 });
  const [messages, setMessages] = useState([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageFilter, setMessageFilter] = useState('all'); // all, unread, read
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [customOrders, setCustomOrders] = useState([]);
  const [customOrderLoading, setCustomOrderLoading] = useState(false);
  const [selectedCustomOrder, setSelectedCustomOrder] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [contactSaving, setContactSaving] = useState(false);

  const [socialFacebook, setSocialFacebook] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialTiktok, setSocialTiktok] = useState('');
  const [socialSaving, setSocialSaving] = useState(false);

  const [easypaisaTitle, setEasypaisaTitle] = useState('');
  const [easypaisaNumber, setEasypaisaNumber] = useState('');
  const [jazzcashTitle, setJazzcashTitle] = useState('');
  const [jazzcashNumber, setJazzcashNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankTitle, setBankTitle] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIban, setBankIban] = useState('');
  const [paymentSaving, setPaymentSaving] = useState(false);

  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('monthly');

  useEffect(() => {
    loadInitialData();

    // Listen for artwork changes
    const handleArtworkChange = () => {
      console.log('Artwork changed, refreshing admin panel...');
      loadArtworks();
      loadStats();
    };

    window.addEventListener('artworkCreated', handleArtworkChange);
    window.addEventListener('artworkUpdated', handleArtworkChange);

    return () => {
      window.removeEventListener('artworkCreated', handleArtworkChange);
      window.removeEventListener('artworkUpdated', handleArtworkChange);
    };
  }, []);



  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'reviews') {
      loadReviews();
    }
    if (activeTab === 'messages') {
      loadMessages();
    }
    if (activeTab === 'custom-orders') {
      loadCustomOrders();
    }
  }, [activeTab, reviewFilter, messageFilter]);

  const loadInitialData = async () => {
    await Promise.all([
      loadArtworks(),
      loadOrders(),
      loadCustomOrders(),
      loadLogo(),
      loadStats(),
      loadConfig(),
    ]);
  };

  const loadConfig = async () => {
    try {
      const grouped = await configService.getAll();
      const branding = (grouped && grouped.branding) ? grouped.branding : {};
      setBrandName(branding.brand_name || '');
      setBrandTagline(branding.brand_tagline || '');
      setBrandDescription(branding.brand_description || '');

      const contact = (grouped && grouped.contact) ? grouped.contact : {};
      setContactEmail(contact.contact_email || '');
      setContactPhone(contact.contact_phone || '');
      setContactAddress(contact.contact_address || '');

      const social = (grouped && grouped.social) ? grouped.social : {};
      setSocialFacebook(social.facebook_url || '');
      setSocialInstagram(social.instagram_url || '');
      setSocialTiktok(social.tiktok_url || '');

      const payment = (grouped && grouped.payment) ? grouped.payment : {};
      setEasypaisaTitle(payment.easypaisa_title || '');
      setEasypaisaNumber(payment.easypaisa_number || '');
      setJazzcashTitle(payment.jazzcash_title || '');
      setJazzcashNumber(payment.jazzcash_number || '');
      setBankName(payment.bank_name || '');
      setBankTitle(payment.bank_account_title || '');
      setBankAccount(payment.bank_account_no || '');
      setBankIban(payment.bank_iban || '');

      // update redux store so header/hero/footer reflect immediately
      try {
        dispatch(setFullConfig(grouped));
      } catch (e) {
        console.debug('Could not dispatch config', e);
      }
    } catch (error) {
      console.error('Failed to load config', error);
    }
  };

  const loadArtworks = async () => {
    try {
      setLoading(true);
      console.log('Admin: Loading artworks with all=true');

      // Pass 'all=true' to get all artworks without pagination for admin panel
      const response = await artworkService.getAll({ all: 'true' });

      console.log('Admin: Raw response:', response);
      console.log('Admin: Response type:', typeof response);
      console.log('Admin: Response keys:', Object.keys(response || {}));

      let artworksData = [];
      if (response && response.data && Array.isArray(response.data)) {
        console.log('Admin: Using response.data, count:', response.data.length);
        artworksData = response.data;
      } else if (Array.isArray(response)) {
        console.log('Admin: Using direct array, count:', response.length);
        artworksData = response;
      } else {
        console.warn('Admin: Unexpected response format');
        toast.error('Unexpected response format from server');
      }

      console.log('Admin: Final artworks count:', artworksData.length);
      setArtworks(artworksData);

      if (artworksData.length === 0) {
        toast.info('No artworks found. Click "Add New Artwork" to create one.');
      }
    } catch (error) {
      console.error('Admin: Load error:', error);
      console.error('Admin: Error response:', error.response?.data);
      console.error('Admin: Error message:', error.message);
      toast.error(`Failed to load artworks: ${error.message}`);
      // Set empty array so UI shows "no artworks" instead of loading forever
      setArtworks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await orderService.getAll();
      let ordersData = [];
      if (response && response.data && Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (Array.isArray(response)) {
        ordersData = response;
      }
      setOrders(ordersData);
    } catch (error) {
      console.error('Load orders error:', error);
    }
  };

  const loadCustomOrders = async () => {
    try {
      setCustomOrderLoading(true);
      const response = await customOrderService.getAll();
      let customOrdersData = [];
      if (response && response.data && Array.isArray(response.data)) {
        customOrdersData = response.data;
      } else if (Array.isArray(response)) {
        customOrdersData = response;
      }
      setCustomOrders(customOrdersData);
    } catch (error) {
      console.error('Load custom orders error:', error);
      toast.error('Failed to load custom orders');
      setCustomOrders([]);
    } finally {
      setCustomOrderLoading(false);
    }
  };

  const loadLogo = async () => {
    try {
      const response = await configService.getLogo();
      if (response && response.logo_url) {
        setLogo(response.logo_url);
        setLogoPreview(response.logo_url);
      }
    } catch (error) {
      console.log('No logo uploaded');
    }
  };

  const loadStats = async () => {
    try {
      const response = await analyticsService.getDashboard();
      setStats({
        totalArtworks: response.total_artworks || 0,
        totalOrders: response.total_orders || 0,
        totalRevenue: response.total_revenue || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const [dashboard, orders, artworks, reviews] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getOrders(),
        analyticsService.getArtworks(),
        analyticsService.getReviews()
      ]);
      setAnalyticsData({
        ...dashboard,
        orders: orders,
        artworks: artworks,
        reviews: reviews
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load full analytics data');
    } finally {
      setAnalyticsLoading(false);
    }
  };



  const handleDeleteArtwork = async (id) => {
    const artwork = artworks.find(a => a.id == id);
    const isDeleted = !!artwork?.deleted_at;
    const action = isDeleted ? 'restore' : 'delete';

    if (!window.confirm(`Are you sure you want to ${action} this artwork?`)) return;

    try {
      const response = await artworkService.delete(Number(id));
      console.log('Delete response:', response);

      // Reload artworks and stats
      await loadArtworks();
      await loadStats();

      // Dispatch custom event to notify gallery and other components
      window.dispatchEvent(new CustomEvent('artworkDeleted', { detail: { id } }));

      toast.success(`Artwork ${action}d successfully`);
    } catch (error) {
      console.error('Delete error:', error);
      const errorMsg = error.response?.data?.message || `Failed to ${action} artwork`;
      toast.error(errorMsg);
    }
  };



  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('logo', file);
      // Use admin upload endpoint for brand/logo
      const response = await api.post('/admin/config/upload-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Response is wrapped in .data by axios
      const data = response.data || response;
      if (data && data.logo_path) {
        // Store the path in Redux so it persists across pages
        dispatch(updateBranding({ site_logo: data.logo_path }));
        localStorage.setItem('siteConfig', JSON.stringify({ ...JSON.parse(localStorage.getItem('siteConfig') || '{}'), branding: { ...(JSON.parse(localStorage.getItem('siteConfig') || '{}').branding || {}), site_logo: data.logo_path } }));
        window.dispatchEvent(new CustomEvent('configUpdated', { detail: JSON.parse(localStorage.getItem('siteConfig') || '{}') }));

        setLogo(data.logo_url);
        toast.success('Logo uploaded successfully! Redirecting to home page...');
        // Redirect to home page after 1.5 seconds
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      console.error('Upload error:', error);
      // If upload fails, still apply the selected logo locally so the site shows it immediately
      toast.error('Failed to upload logo to server — applying locally');
      // reader.result was already set as preview; persist this to redux/localStorage so header shows it
      try {
        dispatch(updateBranding({ site_logo: logoPreview }));
        localStorage.setItem('siteConfig', JSON.stringify({ ...JSON.parse(localStorage.getItem('siteConfig') || '{}'), branding: { ...(JSON.parse(localStorage.getItem('siteConfig') || '{}').branding || {}), site_logo: logoPreview } }));
        window.dispatchEvent(new CustomEvent('configUpdated', { detail: JSON.parse(localStorage.getItem('siteConfig') || '{}') }));
      } catch (e) {
        console.debug('Could not persist local logo', e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBrandSave = async () => {
    try {
      // Ensure we have an auth token before calling admin endpoint
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('You are not authenticated. Please log in as admin.');
        navigate('/admin/login');
        return;
      }
      setBrandSaving(true);
      const payload = {
        brand_name: brandName,
        brand_tagline: brandTagline,
        brand_description: brandDescription,
      };
      await api.post('/admin/config/brand', payload);
      // Apply branding locally immediately so the whole site reflects changes
      try { dispatch(updateBranding(payload)); } catch (e) { console.debug('Could not dispatch updateBranding', e); }
      // refresh config and update store
      const full = await configService.getAll();
      try { dispatch(setFullConfig(full)); } catch (e) { }
      try { localStorage.setItem('siteConfig', JSON.stringify(full)); } catch (e) { }
      window.dispatchEvent(new CustomEvent('configUpdated', { detail: full }));
      toast.success('Brand settings saved');
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data || {};
      console.error('Brand save error:', { status, data, error });
      const serverMsg = data.message || (data.error || data.errors && Object.values(data.errors).flat()[0]);
      toast.error(`Failed to save brand settings: ${serverMsg || error.message} (${status || 'error'})`);
    } finally {
      setBrandSaving(false);
    }
  };

  const handleContactSave = async () => {
    try {
      setContactSaving(true);
      const payload = {
        contact_email: contactEmail,
        contact_phone: contactPhone,
        contact_address: contactAddress,
      };
      await configService.updateContact(payload);

      // refresh config
      const full = await configService.getAll();
      try { dispatch(setFullConfig(full)); } catch (e) { }
      window.dispatchEvent(new CustomEvent('configUpdated', { detail: full }));

      toast.success('Contact information saved');
    } catch (error) {
      console.error('Contact save error:', error);
      toast.error('Failed to save contact information');
    } finally {
      setContactSaving(false);
    }
  };

  const handleSocialSave = async () => {
    try {
      setSocialSaving(true);
      const payload = {
        facebook_url: socialFacebook,
        instagram_url: socialInstagram,
        tiktok_url: socialTiktok,
      };
      await configService.updateSocial(payload);

      // refresh config
      const full = await configService.getAll();
      try { dispatch(setFullConfig(full)); } catch (e) { }
      window.dispatchEvent(new CustomEvent('configUpdated', { detail: full }));

      toast.success('Social media links saved');
    } catch (error) {
      console.error('Social save error:', error);
      toast.error('Failed to save social media links');
    } finally {
      setSocialSaving(false);
    }
  };

  const handlePaymentSave = async () => {
    try {
      setPaymentSaving(true);
      const payload = {
        easypaisa_title: easypaisaTitle,
        easypaisa_number: easypaisaNumber,
        jazzcash_title: jazzcashTitle,
        jazzcash_number: jazzcashNumber,
        bank_name: bankName,
        bank_account_title: bankTitle,
        bank_account_no: bankAccount,
        bank_iban: bankIban,
      };
      await configService.updatePayment(payload);

      // refresh config
      const full = await configService.getAll();
      try { dispatch(setFullConfig(full)); } catch (e) { }
      window.dispatchEvent(new CustomEvent('configUpdated', { detail: full }));

      toast.success('Payment settings saved');
    } catch (error) {
      console.error('Payment save error:', error);
      toast.error('Failed to save payment settings');
    } finally {
      setPaymentSaving(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await orderService.updateStatus(orderId, status);
      await loadOrders();
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleUpdateCustomOrderStatus = async (orderId, status) => {
    try {
      await customOrderService.updateStatus(orderId, status);
      await loadCustomOrders();
      toast.success('Custom order status updated');
    } catch (error) {
      toast.error('Failed to update custom order status');
    }
  };

  const handleDeleteCustomOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this custom order request?')) return;
    try {
      await customOrderService.delete(orderId);
      await loadCustomOrders();
      toast.success('Custom order deleted');
    } catch (error) {
      toast.error('Failed to delete custom order');
    }
  };

  const loadReviews = async () => {
    try {
      setReviewLoading(true);
      const params = {};
      if (reviewFilter !== 'all') {
        if (reviewFilter === 'featured') {
          params.featured = 'true';
        } else {
          params.status = reviewFilter;
        }
      }
      const response = await reviewService.adminGetAll(params);
      let reviewsData = [];
      if (response && response.data && Array.isArray(response.data)) {
        reviewsData = response.data;
      } else if (Array.isArray(response)) {
        reviewsData = response;
      }
      setReviews(reviewsData);

      // Load stats for reviews if not already loaded or refresh them
      const statsResponse = await api.get('/admin/config/dashboard-stats');
      if (statsResponse) {
        setReviewStats({
          total: statsResponse.total_reviews || 0,
          pending: statsResponse.pending_reviews || 0,
          approved: statsResponse.approved_reviews || 0,
          featured: statsResponse.featured_reviews || 0,
        });
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewService.adminDelete(id);
      toast.success('Review deleted');
      loadReviews();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleUpdateReviewStatus = async (id, status) => {
    try {
      await reviewService.adminUpdate(id, { status });
      toast.success(`Review ${status}`);
      loadReviews();
    } catch (error) {
      toast.error(`Failed to ${status} review`);
    }
  };

  const handleToggleFeaturedReview = async (review) => {
    try {
      await reviewService.adminUpdate(review.id, { is_featured: !review.is_featured });
      toast.success(review.is_featured ? 'Removed from featured' : 'Added to featured');
      loadReviews();
    } catch (error) {
      toast.error('Failed to update featured status');
    }
  };

  const loadMessages = async () => {
    try {
      setMessageLoading(true);
      const response = await contactService.getAll();
      let messagesData = [];
      if (response && response.data && Array.isArray(response.data)) {
        messagesData = response.data;
      } else if (Array.isArray(response)) {
        messagesData = response;
      }

      if (messageFilter !== 'all') {
        messagesData = messagesData.filter(m => m.status === messageFilter);
      }

      setMessages(messagesData);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setMessageLoading(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await contactService.delete(id);
      toast.success('Message deleted');
      loadMessages();
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    if (message.status === 'new') {
      try {
        await contactService.getById(message.id);
        // Update local state to reflect 'read' status
        setMessages(prev => prev.map(m => m.id === message.id ? { ...m, status: 'read' } : m));
      } catch (error) {
        console.error('Failed to mark message as read:', error);
      }
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    try {
      setSendingReply(true);
      await contactService.reply(selectedMessage.id, replyText);
      toast.success('Reply recorded and sent!');
      setReplyText('');
      setIsReplying(false);
      // Update local state to reflect 'responded' status
      setMessages(prev => prev.map(m => m.id === selectedMessage.id ? { ...m, status: 'responded' } : m));
      // Refresh messages to show updated status if needed
      // loadMessages(); // Optional if we update locally
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleArtworkSuccess = async () => {
    setShowForm(false);
    setEditingArtwork(null);

    // Force reload artworks to get updated data with images
    await loadArtworks();
    await loadStats();

    // Dispatch event to refresh gallery on other pages
    window.dispatchEvent(new CustomEvent('artworkUpdated'));
  };



  const handleExportReport = async () => {
    try {
      toast.loading('Generating report...');
      const response = await analyticsService.exportData();

      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sidra_ink_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss();
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.dismiss();
      toast.error('Failed to generate export');
    }
  };

  // Dashboard Overview Tab
  const renderDashboard = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#E8D5C4] text-[#1C1C1C] p-6 rounded-3xl shadow-lg border border-[#C5A059]/30">
          <div className="text-xs font-bold uppercase tracking-wider opacity-80">Total Artworks</div>
          <div className="text-4xl font-black mt-2">{stats.totalArtworks}</div>
          <p className="text-xs mt-2 font-medium opacity-70">Active pieces in gallery</p>
        </div>

        <div className="bg-[#C5A059] text-white p-6 rounded-3xl shadow-lg border border-[#C5A059]">
          <div className="text-xs font-bold uppercase tracking-wider opacity-90">Total Orders</div>
          <div className="text-4xl font-black mt-2">{stats.totalOrders}</div>
          <p className="text-xs mt-2 font-medium opacity-80">All time orders</p>
        </div>

        <div className="bg-[#1C1C1C] text-[#C5A059] p-6 rounded-3xl shadow-lg border border-[#C5A059]/20">
          <div className="text-xs font-bold uppercase tracking-wider opacity-80">Total Revenue</div>
          <div className="text-4xl font-black mt-2">Rs. {stats.totalRevenue.toFixed(0)}</div>
          <p className="text-xs mt-2 font-medium text-white/60">Total earnings</p>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => { setActiveTab('artworks'); setEditingArtwork(null); setShowForm(true); }}
            className="bg-[#E8D5C4] hover:bg-[#DBC8B5] text-[#1C1C1C] py-4 rounded-xl font-bold transition shadow-md border border-[#C5A059]/20"
          >
            ➕ Add New Artwork
          </button>
          <button
            onClick={() => setActiveTab('logo')}
            className="bg-[#1C1C1C] hover:bg-black text-[#C5A059] py-4 rounded-xl font-bold transition shadow-md border border-[#C5A059]/20"
          >
            🖼️ Manage Logo
          </button>
        </div>
      </div>
    </div>
  );

  // Artworks Management Tab
  const renderArtworks = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Artworks</h2>
        <button
          onClick={() => { setEditingArtwork(null); setShowForm(!showForm); }}
          className="bg-rose-200 hover:bg-rose-300 text-ink-900 px-6 py-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg"
        >
          {showForm ? '✕ Cancel' : '➕ Add New Artwork'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg mb-6 shadow-lg border-l-4 border-amber-600">
          <h3 className="text-xl font-bold mb-4 text-gray-800">{editingArtwork ? '✏️ Edit Artwork' : '➕ Create New Artwork'}</h3>
          <ArtworkForm
            artwork={editingArtwork}
            onSuccess={handleArtworkSuccess}
          />
        </div>
      )}

      {artworks.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">🎨</div>
          <p className="text-xl text-gray-600 mb-2">No artworks yet</p>
          <p className="text-gray-500">Click "Add New Artwork" to create your first piece</p>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4 animate-pulse">⏳</div>
          <p className="text-xl text-gray-600">Loading artworks...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {artworks.map(artwork => (
            <div
              key={artwork.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 ${artwork.deleted_at ? 'opacity-50 border-2 border-red-300' : 'border border-gray-200'
                }`}
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <img
                  src={getArtworkImageUrl(artwork)}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
                {/* Status Badge */}
                <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                  {artwork.deleted_at ? (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      DELETED
                    </span>
                  ) : (
                    <>
                      {artwork.featured && (
                        <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          ⭐ FEATURED
                        </span>
                      )}
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        ACTIVE
                      </span>
                    </>
                  )}

                  {/* Image Count Badge */}
                  {artwork.images && artwork.images.length > 1 && (
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      📷 {artwork.images.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 text-gray-800 truncate" title={artwork.title}>
                  {artwork.title}
                </h3>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10">
                  {artwork.description}
                </p>

                <div className="flex justify-between items-center mb-3 pb-3 border-b">
                  <div>
                    <p className="text-amber-600 font-bold text-xl">Rs. {parseFloat(artwork.price).toFixed(0)}</p>
                    <p className="text-xs text-gray-500">{typeof artwork.category === 'object' ? artwork.category?.name : (artwork.category || 'Uncategorized')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Stock: {artwork.stock_quantity || 0}</p>
                    <p className="text-xs text-gray-500">{artwork.dimensions || 'N/A'}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingArtwork(artwork); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={!!artwork.deleted_at}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow hover:shadow-md"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteArtwork(artwork.id)}
                    className={`flex-1 py-2 px-3 rounded-lg font-semibold transition shadow hover:shadow-md ${artwork.deleted_at
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                  >
                    {artwork.deleted_at ? '♻️ Restore' : '🗑️ Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Logo Management Tab
  const renderLogoTab = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Website Logo Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo Upload Section */}
        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-semibold mb-4">Upload Logo</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Logo Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={loading}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-amber-600 transition"
            />
            <p className="text-xs text-gray-500 mt-2">Recommended: PNG or JPG, max 2MB, square format (200x200px)</p>
          </div>

          {loading && (
            <div className="text-center text-amber-600">
              <p>Uploading...</p>
            </div>
          )}
        </div>

        {/* Logo Preview Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Logo Preview</h3>

          <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center min-h-56">
            {logoPreview ? (
              <div className="text-center">
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  className="h-32 mx-auto rounded-lg shadow-md mb-3"
                />
                <p className="text-sm text-gray-600">This logo will appear on your website</p>
                <p className="text-xs text-green-600 font-semibold mt-2">✓ Logo set successfully</p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p className="text-lg">No logo uploaded yet</p>
                <p className="text-sm mt-2">Upload a logo to see preview</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
        <h4 className="font-semibold text-blue-900 mb-2">💡 About Logo Display</h4>
        <p className="text-sm text-blue-800">
          Your uploaded logo will appear in the header and hero section of your website.
          It will be visible on all pages including Home, Gallery, Blog, and other sections.
          Make sure to use a high-quality image with transparent background for best results.
        </p>
      </div>
    </div>
  );

  // Orders Management Tab (single implementation kept below)

  // Reviews Management Tab
  const renderReviews = () => (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Manage Reviews</h2>

        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'approved', 'rejected', 'featured'].map((f) => (
            <button
              key={f}
              onClick={() => setReviewFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${reviewFilter === f
                ? 'bg-[#C5A059] text-[#1C1C1C] shadow-lg scale-105'
                : 'bg-white text-gray-500 hover:bg-[#E8D5C4] hover:text-[#1C1C1C] border border-gray-100'
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'pending' && reviewStats.pending > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-black ${reviewFilter === f ? 'bg-[#1C1C1C] text-[#C5A059]' : 'bg-[#C5A059] text-[#1C1C1C]'}`}>
                  {reviewStats.pending}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1C1C1C] p-5 rounded-2xl shadow-lg border border-[#C5A059]/20">
          <div className="text-[#C5A059]/60 text-xs uppercase font-black tracking-widest mb-1">Total Reviews</div>
          <div className="text-3xl font-black text-white">{reviewStats.total}</div>
        </div>
        <div className="bg-[#E8D5C4] p-5 rounded-2xl shadow-lg border border-[#C5A059]/30">
          <div className="text-[#1C1C1C]/60 text-xs uppercase font-black tracking-widest mb-1">Pending Approval</div>
          <div className="text-3xl font-black text-[#1C1C1C]">{reviewStats.pending}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-lg border border-[#C5A059]/40">
          <div className="text-gray-400 text-xs uppercase font-black tracking-widest mb-1">Approved</div>
          <div className="text-3xl font-black text-[#1C1C1C]">{reviewStats.approved}</div>
        </div>
        <div className="bg-[#C5A059] p-5 rounded-2xl shadow-lg border border-[#C5A059]">
          <div className="text-white/70 text-xs uppercase font-black tracking-widest mb-1">Featured on Home</div>
          <div className="text-3xl font-black text-white">{reviewStats.featured}</div>
        </div>
      </div>

      {reviewLoading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="animate-spin text-amber-600 text-4xl mb-4">⏳</div>
          <p className="text-xl text-gray-600">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-gray-300 text-6xl mb-4">⭐</div>
          <p className="text-xl text-gray-600 mb-2">No reviews found</p>
          <p className="text-gray-500">Reviews from customers will appear here for moderation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#C5A059] text-[#1C1C1C] w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0 shadow-inner">
                      {review.user?.name?.charAt(0) || review.customer_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 leading-tight">
                        {review.user?.name || review.customer_name || 'Anonymous Customer'}
                      </h3>
                      <p className="text-gray-500 text-sm mb-2">{review.user?.email || review.customer_email}</p>
                      <div className="flex items-center gap-1 text-[#C5A059]">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'text-xl' : 'text-xl text-gray-200'}>★</span>
                        ))}
                        <span className="ml-2 text-gray-400 text-xs font-bold uppercase tracking-tighter bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 self-start">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${review.status === 'approved' ? 'bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20' :
                      review.status === 'rejected' ? 'bg-gray-100 text-gray-500 border border-gray-200' :
                        'bg-[#E8D5C4]/30 text-[#1C1C1C] border border-[#C5A059]/20'
                      }`}>
                      {review.status}
                    </span>
                    {review.is_featured && (
                      <span className="bg-[#1C1C1C] text-[#C5A059] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#C5A059]/30">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                </div>

                {review.artwork && (
                  <div className="mb-4 p-4 bg-[#fdfcf9] rounded-2xl flex items-center gap-4 border border-[#E8D5C4]/30">
                    <div className="w-14 h-14 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                      <img src={getArtworkImageUrl(review.artwork)} alt={`${review.artwork?.title || 'Artwork'} - Customer Review`} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#C5A059] font-black uppercase tracking-[0.2em]">Review for:</span>
                      <p className="text-sm font-bold text-[#1C1C1C]">{review.artwork.title}</p>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <p className="text-[#1C1C1C]/80 italic border-l-4 border-[#C5A059] pl-6 py-2 bg-[#E8D5C4]/10 rounded-r-2xl text-base leading-relaxed">
                    "{review.comment || 'No comment provided'}"
                  </p>
                </div>

                <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    {review.status !== 'approved' && (
                      <button
                        onClick={() => handleUpdateReviewStatus(review.id, 'approved')}
                        className="bg-[#C5A059] hover:bg-[#1C1C1C] text-[#1C1C1C] hover:text-[#C5A059] px-4 py-2 rounded-xl text-sm font-black transition flex items-center gap-2 shadow-md"
                      >
                        ✓ Approve
                      </button>
                    )}
                    {review.status !== 'rejected' && (
                      <button
                        onClick={() => handleUpdateReviewStatus(review.id, 'rejected')}
                        className="bg-[#1C1C1C] hover:bg-black text-[#C5A059] px-4 py-2 rounded-xl text-sm font-black transition flex items-center gap-2 shadow-md border border-[#C5A059]/20"
                      >
                        ✕ Reject
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleFeaturedReview(review)}
                      className={`px-4 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2 border-2 ${review.is_featured
                        ? 'bg-[#1C1C1C] text-[#C5A059] border-[#C5A059]'
                        : 'bg-white text-gray-500 border-gray-100 hover:border-[#C5A059] hover:text-[#C5A059]'
                        }`}
                    >
                      {review.is_featured ? '⭐ Unfeature' : '⭐ Feature on Home'}
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="bg-gray-100 hover:bg-black hover:text-white text-gray-500 px-4 py-2 rounded-xl text-sm font-black transition flex items-center gap-2"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Messages Management Tab
  const renderMessages = () => {
    const filteredMessages = messages.filter(m => {
      if (messageFilter === 'all') return true;
      if (messageFilter === 'unread') return m.status === 'new';
      return m.status === messageFilter;
    });

    return (
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold">Contact Messages</h2>

          <div className="flex flex-wrap gap-2">
            {['all', 'unread', 'read', 'responded'].map((f) => (
              <button
                key={f}
                onClick={() => setMessageFilter(f)}
                className={`px-4 py-1 rounded-full text-sm font-medium transition ${messageFilter === f
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'unread' && messages.filter(m => m.status === 'new').length > 0 && (
                  <span className="ml-2 bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                    {messages.filter(m => m.status === 'new').length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {messageLoading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin text-blue-600 text-4xl mb-4">...</div>
            <p className="text-xl text-gray-600">Loading messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-300 text-6xl mb-4">M</div>
            <p className="text-xl text-gray-600 mb-2">No messages found</p>
            <p className="text-gray-500">Contact form submissions will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">From</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMessages.map((msg) => (
                    <tr key={msg.id} className={`hover:bg-gray-50 transition-colors ${msg.status === 'new' ? 'bg-blue-50/30' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${msg.status === 'responded' ? 'bg-green-100 text-green-800' :
                          msg.status === 'read' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800 animate-pulse'
                          }`}>
                          {msg.status === 'responded' ? 'Responded' :
                            msg.status === 'read' ? 'Read' : 'New'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${msg.status === 'new' ? 'font-bold' : 'font-medium'} text-gray-900`}>{msg.name}</div>
                        <div className="text-xs text-gray-500">{msg.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${msg.status === 'new' ? 'font-bold text-gray-900' : 'text-gray-600'} truncate max-w-xs`}>
                          {msg.subject}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleViewMessage(msg)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-lg transition"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedMessage && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b bg-gray-50">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Message Details</h3>
                    <p className="text-xs text-gray-500">Received on {new Date(selectedMessage.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-100 rounded-full"
                >
                  <span className="text-3xl">&times;</span>
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">From</h4>
                      <p className="text-lg font-bold text-gray-900">{selectedMessage.name}</p>
                      <p className="text-blue-600 text-sm font-medium">{selectedMessage.email}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</h4>
                      <p className="text-gray-700 font-medium">{selectedMessage.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Subject</h4>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <p className="text-gray-900 font-bold">{selectedMessage.subject}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Message</h4>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 min-h-[150px] overflow-y-auto">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 flex flex-col gap-4">
                {isReplying ? (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-700">Compose Reply</h4>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition min-h-[120px]"
                      placeholder="Type your reply here..."
                      disabled={sendingReply}
                    ></textarea>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setIsReplying(false)}
                        className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition"
                        disabled={sendingReply}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendReply}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold transition flex items-center gap-2 disabled:opacity-50"
                        disabled={sendingReply}
                      >
                        {sendingReply ? 'Sending...' : 'Send Reply'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setIsReplying(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-blue-200"
                    >
                      Reply Now
                    </button>
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-700 transition"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Configuration Tab
  const renderConfig = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Site Configuration</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Brand Settings */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 transition hover:shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
            <span>📝</span> Brand Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Site Name</label>
              <input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tagline</label>
              <input
                value={brandTagline}
                onChange={(e) => setBrandTagline(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Short Description</label>
              <textarea
                value={brandDescription}
                onChange={(e) => setBrandDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none resize-none"
              />
            </div>
            <button
              onClick={handleBrandSave}
              disabled={brandSaving}
              className="w-full bg-[#C5A059] text-white py-2 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50"
            >
              {brandSaving ? 'Saving...' : 'Save Brand Settings'}
            </button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 transition hover:shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
            <span>📞</span> Contact Info
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
              <input
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address / Location</label>
              <textarea
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none resize-none"
              />
            </div>
            <button
              onClick={handleContactSave}
              disabled={contactSaving}
              className="w-full bg-[#1C1C1C] text-[#C5A059] py-2 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50"
            >
              {contactSaving ? 'Saving...' : 'Save Contact Info'}
            </button>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 transition hover:shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
            <span>📱</span> Social Links
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Facebook URL</label>
              <input
                value={socialFacebook}
                onChange={(e) => setSocialFacebook(e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instagram URL</label>
              <input
                value={socialInstagram}
                onChange={(e) => setSocialInstagram(e.target.value)}
                placeholder="https://instagram.com/yourhandle"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">TikTok URL</label>
              <input
                value={socialTiktok}
                onChange={(e) => setSocialTiktok(e.target.value)}
                placeholder="https://tiktok.com/@yourhandle"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none"
              />
            </div>
            <button
              onClick={handleSocialSave}
              disabled={socialSaving}
              className="w-full bg-[#E8D5C4] text-[#1C1C1C] py-2 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50"
            >
              {socialSaving ? 'Saving...' : 'Save Social Links'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions / Tips */}
      <div className="mt-8 bg-[#E8D5C4]/20 rounded-xl p-6 border border-[#C5A059]/20">
        <h4 className="font-bold text-[#1C1C1C] mb-2 flex items-center gap-2">
          <span>💡</span> Configuration Tip
        </h4>
        <p className="text-[#1C1C1C]/70 text-sm">
          Any changes you save here will be reflected across the website, including the footer and contact page.
          Make sure to use full URLs (starting with https://) for social media links.
        </p>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Payment Configuration</h2>
      
      <div className="max-w-lg">
        {/* Bank Transfer */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100">
          <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
            <span className="w-4 h-4 bg-blue-500 rounded-full inline-block"></span> Bank Transfer Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bank Name</label>
              <input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. BANK AL HABIB Limited"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Account Title</label>
              <input
                value={bankTitle}
                onChange={(e) => setBankTitle(e.target.value)}
                placeholder="e.g. SIDRA MASOOD"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Account Number</label>
              <input
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="e.g. 0458-1824-001750-01-8"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">IBAN</label>
              <input
                value={bankIban}
                onChange={(e) => setBankIban(e.target.value)}
                placeholder="e.g. PK30 BAHL 0458 1824 0017 5001"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-start">
        <button
          onClick={handlePaymentSave}
          disabled={paymentSaving}
          className="bg-[#C5A059] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#1C1C1C] transition-all shadow-lg disabled:opacity-50"
        >
          {paymentSaving ? 'Saving...' : 'Save Bank Details'}
        </button>
      </div>
    </div>
  );



  // Analytics Tab
  const renderAnalytics = () => (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Analytics & Reports</h2>
          <p className="text-gray-500">Business performance and statistical insights</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="bg-[#C5A059] text-[#1C1C1C] px-6 py-2 rounded-2xl font-black hover:bg-[#1C1C1C] hover:text-[#C5A059] transition-all duration-300 flex items-center gap-2 shadow-md border border-[#C5A059]/20"
          disabled={analyticsLoading}
        >
          {analyticsLoading ? '⌛ Refreshing...' : '🔄 Refresh Data'}
        </button>
      </div>

      {!analyticsData && !analyticsLoading ? (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">📊</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Initialize Analytics</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">Click the button below to load your shop's performance data and sales reports.</p>
          <button
            onClick={fetchAnalytics}
            className="bg-rose-200 text-ink-900 px-8 py-3 rounded-2xl font-bold hover:bg-rose-300 transition shadow-lg shadow-gray-200"
          >
            Load Analytics Dashboard
          </button>
        </div>
      ) : analyticsLoading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
          <p className="text-gray-500 font-medium">Crunching the latest numbers...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#1C1C1C] p-6 rounded-[2rem] text-white shadow-2xl shadow-[#1C1C1C]/20 relative overflow-hidden group border border-[#C5A059]/30">
              <div className="relative z-10">
                <p className="text-[#C5A059] font-black uppercase text-[10px] tracking-[0.2em] mb-2">Total Revenue</p>
                <h3 className="text-4xl font-black tracking-tight">Rs. {parseFloat(analyticsData.total_revenue || 0).toLocaleString()}</h3>
                <div className="mt-6 flex items-center text-[10px] text-[#C5A059]/60 font-black uppercase tracking-wider">
                  <span className="bg-[#C5A059]/10 border border-[#C5A059]/20 px-3 py-1 rounded-full mr-3 text-[#C5A059]">All Time</span>
                  <span>Based on completed orders</span>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 p-8 text-white/5 text-8xl font-black transform rotate-12 group-hover:scale-125 group-hover:rotate-0 transition-all duration-500">💰</div>
            </div>

            <div className="bg-[#E8D5C4] p-6 rounded-[2rem] border border-[#C5A059]/30 shadow-xl shadow-[#E8D5C4]/20 relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[#1C1C1C]/60 font-black uppercase text-[10px] tracking-[0.2em] mb-2">Total Orders</p>
                <h3 className="text-4xl font-black text-[#1C1C1C] tracking-tight">{analyticsData.total_orders || 0}</h3>
                <div className="mt-6 flex items-center text-[10px] text-[#1C1C1C]/40 font-black uppercase tracking-wider">
                  <span className="bg-[#1C1C1C] text-[#C5A059] px-3 py-1 rounded-full mr-3 font-black shadow-sm">{analyticsData.pending_orders || 0} Pending</span>
                  <span>Needs attention</span>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 p-8 text-[#1C1C1C]/5 text-8xl font-black transform rotate-12 group-hover:scale-125 group-hover:rotate-0 transition-all duration-500">📦</div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-[#E8D5C4] shadow-xl shadow-gray-50 relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[#C5A059] font-black uppercase text-[10px] tracking-[0.2em] mb-2">Artworks</p>
                <h3 className="text-4xl font-black text-[#1C1C1C] tracking-tight">{analyticsData.total_artworks || 0}</h3>
                <div className="mt-6 flex items-center text-[10px] text-gray-400 font-black uppercase tracking-wider">
                  <span className="bg-[#E8D5C4]/40 text-[#1C1C1C] px-3 py-1 rounded-full mr-3 font-black">{analyticsData.artworks?.total_sales || 0} Sold</span>
                  <span>Total prints/pieces</span>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 p-8 text-[#C5A059]/5 text-8xl font-black transform rotate-12 group-hover:scale-125 group-hover:rotate-0 transition-all duration-500">🎨</div>
            </div>

            <div className="bg-[#C5A059] p-6 rounded-[2rem] shadow-xl shadow-[#C5A059]/20 relative overflow-hidden group border border-[#C5A059]/20">
              <div className="relative z-10">
                <p className="text-[#1C1C1C] font-black uppercase text-[10px] tracking-[0.2em] mb-2">Reviews</p>
                <h3 className="text-4xl font-black text-[#1C1C1C] tracking-tight">{analyticsData.total_reviews || 0}</h3>
                <div className="mt-6 flex items-center text-[10px] text-[#1C1C1C]/60 font-black uppercase tracking-wider">
                  <span className="bg-[#1C1C1C] text-[#C5A059] px-3 py-1 rounded-full mr-3 font-black shadow-sm">⭐ {parseFloat(analyticsData.reviews?.avg_rating || 0).toFixed(1)}</span>
                  <span>Average rating</span>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 p-8 text-white/10 text-8xl font-black transform rotate-12 group-hover:scale-125 group-hover:rotate-0 transition-all duration-500">⭐</div>
            </div>

            {/* New Real Metrics requested by user */}
            <div className="bg-[#E8D5C4]/30 p-6 rounded-[2rem] border border-[#C5A059]/30 shadow-xl relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[#1C1C1C]/60 font-black uppercase text-[10px] tracking-[0.2em] mb-2">Avg. Artwork Price</p>
                <h3 className="text-4xl font-black text-[#1C1C1C] tracking-tight">Rs. {Math.round(analyticsData.avg_artwork_price || 0).toLocaleString()}</h3>
                <div className="mt-6 flex items-center text-[10px] text-[#1C1C1C]/40 font-black uppercase tracking-wider">
                  <span className="bg-[#1C1C1C] text-[#C5A059] px-3 py-1 rounded-full mr-3 font-black shadow-sm">REAL</span>
                  <span>Across entire gallery</span>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 p-8 text-[#1C1C1C]/5 text-8xl font-black transform rotate-12 group-hover:scale-125 group-hover:rotate-0 transition-all duration-500">📉</div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-[#C5A059]/20 shadow-xl relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[#C5A059] font-black uppercase text-[10px] tracking-[0.2em] mb-2">Highest Price Item</p>
                <h3 className="text-4xl font-black text-[#1C1C1C] tracking-tight">Rs. {parseFloat(analyticsData.highest_price_item || 0).toLocaleString()}</h3>
                <div className="mt-6 flex items-center text-[10px] text-gray-400 font-black uppercase tracking-wider">
                  <span className="bg-[#C5A059]/20 text-[#1C1C1C] px-3 py-1 rounded-full mr-3 font-black">PREMIUM</span>
                  <span>Top value piece</span>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 p-8 text-[#C5A059]/5 text-8xl font-black transform rotate-12 group-hover:scale-125 group-hover:rotate-0 transition-all duration-500">💎</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Orders Statistics */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100 p-8">
              <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-sm">📦</span>
                Order Status Breakdown
              </h4>
              <div className="space-y-4">
                {[
                  { label: 'Pending Orders', count: analyticsData.orders?.pending, color: 'bg-yellow-500' },
                  { label: 'Processing', count: analyticsData.orders?.processing, color: 'bg-blue-500' },
                  { label: 'Shipped', count: analyticsData.orders?.shipped, color: 'bg-purple-500' },
                  { label: 'Delivered / Completed', count: analyticsData.orders?.delivered, color: 'bg-green-500' },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-600">{item.label}</span>
                      <span className="font-black text-gray-900">{item.count || 0}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${(item.count / (analyticsData.total_orders || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Artwork performance */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100 p-8">
              <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center text-sm">✨</span>
                Artwork Performance
              </h4>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-amber-200 transition">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter mb-1">Total Views</p>
                  <p className="text-3xl font-black text-gray-900">{analyticsData.artworks?.total_views?.toLocaleString() || 0}</p>
                </div>
                <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-amber-200 transition">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter mb-1">Total Sales</p>
                  <p className="text-3xl font-black text-gray-900">{analyticsData.artworks?.total_sales?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-gray-400" style={{ backgroundColor: '#1C1C1C' }}>
            <div className="relative z-10 text-center md:text-left">
              <h4 className="text-2xl font-bold mb-2 tracking-tight text-white">Export Data Report</h4>
              <p className="text-gray-300 max-w-md">Download a comprehensive CSV report containing all sales, customer data, and artwork performance for your bookkeeping.</p>
            </div>
            <button
              onClick={handleExportReport}
              className="relative z-10 px-8 py-3 rounded-2xl font-black transition shadow-xl shrink-0 cursor-pointer"
              style={{ backgroundColor: '#E8D5C4', color: '#1C1C1C' }}>
              Download Report (.CSV)
            </button>
            <div className="absolute -bottom-10 -left-10 text-white/5 text-[200px] leading-none select-none pointer-events-none">📈</div>
          </div>
        </div>
      )}
    </div>
  );

  // Custom Orders Tab
  const renderCustomOrders = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Custom Orders</h2>

      <div className="bg-white rounded-lg overflow-hidden shadow-md">
        {customOrderLoading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mb-2"></div>
            <p>Loading custom orders...</p>
          </div>
        ) : customOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">No custom order requests yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Reference</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Type/Size</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Budget</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customOrders.map(order => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-4">
                      {order.reference_image ? (
                        <div className="w-16 h-16 rounded overflow-hidden border border-gray-200 cursor-pointer hover:opacity-80 transition"
                          onClick={() => setPreviewImage(getImageUrl(order.reference_image))}>
                          <img
                            src={getImageUrl(order.reference_image)}
                            alt="Reference"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{order.name}</div>
                      <div className="text-sm text-gray-500">{order.email}</div>
                      <div className="text-sm text-gray-500">{order.phone}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-bold text-gray-800 uppercase">{order.type}</div>
                      <div className="text-xs text-gray-500">{order.size}</div>
                      <div className="text-[10px] text-gray-400 mt-1">{new Date(order.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600 max-w-[200px] line-clamp-2" title={order.description}>
                        {order.description}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-amber-600 font-bold">Rs. {parseFloat(order.budget || 0).toLocaleString()}</div>
                      <div className="text-[10px] text-gray-400">User's Budget</div>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={order.status || 'pending'}
                        onChange={(e) => handleUpdateCustomOrderStatus(order.id, e.target.value)}
                        className={`px-3 py-1 border rounded text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            order.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setSelectedCustomOrder(order)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDeleteCustomOrder(order.id)}
                          className="text-red-600 hover:text-red-900 text-xs font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Order Details Modal */}
      {selectedCustomOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b bg-gray-50 text-gray-900">
              <div>
                <h3 className="text-xl font-bold">Custom Order Details</h3>
                <p className="text-xs text-gray-500">Submitted on {new Date(selectedCustomOrder.created_at).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedCustomOrder(null)}
                className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-100 rounded-full text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Reference Image */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Reference Image</h4>
                  {selectedCustomOrder.reference_image ? (
                    <div className="rounded-xl overflow-hidden border border-gray-200 cursor-pointer"
                      onClick={() => setPreviewImage(getImageUrl(selectedCustomOrder.reference_image))}>
                      <img
                        src={getImageUrl(selectedCustomOrder.reference_image)}
                        alt="Reference"
                        className="w-full h-auto object-contain max-h-[400px] hover:scale-[1.02] transition-transform"
                      />
                      <div className="p-3 bg-gray-50 text-center">
                        <span className="text-blue-600 font-bold text-sm">
                          Click to Enlarge
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400 italic">
                      No reference image provided
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Info</h4>
                    <p className="text-lg font-bold text-gray-900">{selectedCustomOrder.name}</p>
                    <p className="text-blue-600 font-medium">{selectedCustomOrder.email}</p>
                    <p className="text-gray-600">{selectedCustomOrder.phone}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Type</h4>
                      <p className="text-gray-900 font-bold uppercase">{selectedCustomOrder.type}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Size</h4>
                      <p className="text-gray-900 font-bold">{selectedCustomOrder.size}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">User's Budget</h4>
                    <p className="text-2xl font-bold text-amber-600">Rs. {parseFloat(selectedCustomOrder.budget || 0).toLocaleString()}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</h4>
                    <p className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedCustomOrder.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedCustomOrder.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        selectedCustomOrder.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                      }`}>
                      {selectedCustomOrder.status || 'pending'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Project Description / Vision</h4>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedCustomOrder.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedCustomOrder(null)}
                className="bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-700 transition shadow-lg"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Orders Management Tab
  const renderOrders = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Orders</h2>

      <div className="bg-white rounded-lg overflow-hidden shadow-md">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Order ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold">#{order.id}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{order.customer_name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{order.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 text-amber-600 font-bold">Rs. {(order.total || order.total_amount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status || 'pending'}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className={`px-3 py-1 border rounded text-sm font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-50 text-yellow-800'
                          }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs font-semibold"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold">Order Details #{selectedOrder.id}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase">Customer Info</h4>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.customer_email}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase">Shipping Address</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {selectedOrder.customer_address || 'Address not provided'}
                    {selectedOrder.customer_city && `, ${selectedOrder.customer_city}`}
                    {selectedOrder.customer_country && `, ${selectedOrder.customer_country}`}
                  </p>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Order Items</h4>
              <div className="bg-gray-50 rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Item</th>
                      <th className="px-4 py-2 text-center">Qty</th>
                      <th className="px-4 py-2 text-right">Price</th>
                      <th className="px-4 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items && selectedOrder.items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-3">
                          <div className="font-medium">{item.artwork?.title || 'Unknown Artwork'}</div>
                          <div className="text-xs text-gray-500">ID: {item.artwork_id}</div>
                        </td>
                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">Rs. {parseFloat(item.unit_price || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-semibold">Rs. {parseFloat(item.subtotal || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 font-bold">
                    <tr>
                      <td colSpan="3" className="px-4 py-3 text-right">Grand Total</td>
                      <td className="px-4 py-3 text-right text-amber-600">
                        Rs. {(selectedOrder.total || selectedOrder.total_amount || 0).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {selectedOrder.notes && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase">Order Notes</h4>
                  <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded border border-yellow-100">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Payment Receipt */}
              {selectedOrder.payment?.receipt_path && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">💳 Payment Receipt</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-xs text-green-600 font-bold mb-3">Customer uploaded payment screenshot:</p>
                    <img
                      src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${selectedOrder.payment.receipt_path}`}
                      alt="Payment Receipt"
                      className="max-w-full max-h-64 object-contain rounded-lg shadow border border-green-100 cursor-pointer hover:opacity-90 transition"
                      onClick={() => setPreviewImage(`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${selectedOrder.payment.receipt_path}`)}
                    />
                    <p className="text-xs text-gray-400 mt-2">Click image to view full size</p>
                  </div>
                </div>
              )}
              {selectedOrder.payment_method === 'bank_transfer' && !selectedOrder.payment?.receipt_path && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">💳 Payment Receipt</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-700 font-medium">⚠️ No receipt uploaded by customer yet.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-paper-warm relative overflow-hidden">
      {/* Hand-drawn Doodle Background Pattern */}
      <div
        className="fixed inset-0 opacity-[0.07] pointer-events-none z-0"
        style={{
          backgroundImage: 'url("/login-bg.jpg")',
          backgroundSize: '400px',
          backgroundRepeat: 'repeat',
        }}
      ></div>

      <div className="relative z-10 py-12">
        <div className="container mx-auto px-6">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl font-script text-ink-900 mb-2 tracking-tight">Admin Dashboard</h1>
              <p className="text-gold-calligraphy font-subheading uppercase tracking-[0.2em] text-xs font-bold">
                Professional Workspace &bull; {siteName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-white/50 border border-ink-100/50 rounded-full text-sm font-bold text-ink-600 hover:bg-white transition-all shadow-sm"
              >
                View Site
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('auth_token');
                  localStorage.removeItem('user');
                  navigate('/admin/login');
                }}
                className="px-6 py-2 bg-rose-50 border border-rose-100 rounded-full text-sm font-bold text-rose-600 hover:bg-rose-100 transition-all shadow-sm"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="bg-white/80 backdrop-blur-md rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.05)] overflow-hidden mb-10 border border-white/50">
            <div className="flex border-b border-ink-50/50 overflow-x-auto no-scrollbar">
              {[
                { id: 'dashboard', label: '📊 Dashboard' },
                { id: 'artworks', label: '🎨 Artworks' },
                { id: 'orders', label: '📦 Orders' },
                { id: 'custom-orders', label: '✨ Custom Orders' },
                { id: 'reviews', label: '⭐ Reviews' },
                { id: 'messages', label: '✉️ Messages' },
                { id: 'logo', label: '🖼️ Logo' },
                { id: 'config', label: '⚙️ Configuration' },
                { id: 'payment', label: '💳 Payment' },
                { id: 'analytics', label: '📈 Analytics' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-8 py-5 font-bold transition-all relative ${activeTab === tab.id
                    ? 'text-ink-900 bg-paper-warm/50'
                    : 'text-ink-400 hover:text-ink-600 hover:bg-paper-warm/30'
                    }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gold-calligraphy"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] p-10 border border-white">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'artworks' && renderArtworks()}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'custom-orders' && renderCustomOrders()}
            {activeTab === 'reviews' && renderReviews()}
            {activeTab === 'messages' && renderMessages()}
            {activeTab === 'logo' && renderLogoTab()}
            {activeTab === 'config' && renderConfig()}
            {activeTab === 'payment' && renderPayment()}
            {activeTab === 'analytics' && renderAnalytics()}
          </div>

          {/* Global Image Lightbox */}
          {previewImage && (
            <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setPreviewImage(null)}>
              <button
                className="absolute top-6 right-6 text-white text-5xl hover:text-amber-500 transition-colors z-[101]"
                onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }}
              >
                &times;
              </button>
              <div className="relative max-w-5xl max-h-screen" onClick={(e) => e.stopPropagation()}>
                <img
                  src={previewImage}
                  alt="Full Preview"
                  className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
