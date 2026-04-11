import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_revenue: 0,
    total_orders: 0,
    total_artworks: 0,
    pending_orders: 0,
    total_customers: 0,
    pending_reviews: 0,
  });
  const [orders, setOrders] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    loadDashboardData();

    // Listen for artwork changes to refresh dashboard
    const handleArtworkChange = () => {
      console.log('Artwork changed, refreshing dashboard...');
      loadDashboardData();
    };

    window.addEventListener('artworkCreated', handleArtworkChange);
    window.addEventListener('artworkUpdated', handleArtworkChange);
    window.addEventListener('artworkDeleted', handleArtworkChange);

    return () => {
      window.removeEventListener('artworkCreated', handleArtworkChange);
      window.removeEventListener('artworkUpdated', handleArtworkChange);
      window.removeEventListener('artworkDeleted', handleArtworkChange);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load data with timeout to prevent hanging
      const timeout = (ms) => new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), ms)
      );

      const loadWithTimeout = (promise) =>
        Promise.race([promise, timeout(5000)]);

      // Load stats first (most important)
      try {
        const statsRes = await loadWithTimeout(api.get('/analytics/dashboard'));
        setStats(statsRes);
      } catch (err) {
        console.warn('Stats load failed:', err.message);
        setStats({
          total_revenue: 0,
          total_orders: 0,
          total_artworks: 0,
          pending_orders: 0,
          total_customers: 0,
          pending_reviews: 0,
        });
      }

      // Load orders and artworks in parallel (less critical)
      Promise.all([
        loadWithTimeout(api.get('/orders?limit=5')).catch(() => []),
        loadWithTimeout(api.get('/artworks?all=true&limit=6')).catch(() => []),
      ]).then(([ordersRes, artworksRes]) => {
        setOrders(ordersRes.data || ordersRes || []);
        setArtworks(artworksRes.data || artworksRes || []);
      });

    } catch (error) {
      console.error('Error loading dashboard:', error);
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Admin Dashboard</h1>
            <p className="header-date">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-avatar">👤</span>
              <div className="user-details">
                <p className="user-name">{user?.name || 'Admin User'}</p>
                <p className="user-role">Administrator</p>
              </div>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Stats Grid */}
        <section className="stats-section">
          <div className="section-header">
            <h2>Key Metrics</h2>
            <div className="period-selector">
              <button
                className={`period-btn ${period === 'week' ? 'active' : ''}`}
                onClick={() => setPeriod('week')}
              >
                Week
              </button>
              <button
                className={`period-btn ${period === 'month' ? 'active' : ''}`}
                onClick={() => setPeriod('month')}
              >
                Month
              </button>
              <button
                className={`period-btn ${period === 'year' ? 'active' : ''}`}
                onClick={() => setPeriod('year')}
              >
                Year
              </button>
            </div>
          </div>

          <div className="stats-grid">
            {/* Revenue Stat */}
            <div className="stat-card revenue">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <p className="stat-label">Total Revenue</p>
                <h3 className="stat-value">
                  ₨{(stats.total_revenue || 0).toLocaleString()}
                </h3>
              </div>
            </div>

            {/* Orders Stat */}
            <div className="stat-card orders">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <p className="stat-label">Total Orders</p>
                <h3 className="stat-value">{stats.total_orders || 0}</h3>
                <span className="stat-change positive">
                  {stats.pending_orders || 0} pending
                </span>
              </div>
            </div>

            {/* Artworks Stat */}
            <div className="stat-card artworks">
              <div className="stat-icon">🖼️</div>
              <div className="stat-content">
                <p className="stat-label">Total Artworks</p>
                <h3 className="stat-value">{stats.total_artworks || 0}</h3>
                <span className="stat-change">Published</span>
              </div>
            </div>

            {/* Customers Stat */}
            <div className="stat-card customers">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <p className="stat-label">Total Customers</p>
                <h3 className="stat-value">{stats.total_customers || 0}</h3>
              </div>
            </div>

            {/* Reviews Stat */}
            <div className="stat-card reviews">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <p className="stat-label">Pending Reviews</p>
                <h3 className="stat-value">{stats.pending_reviews || 0}</h3>
                <span className="stat-change">Needs approval</span>
              </div>
            </div>

            {/* Social Feeds */}
            <div className="stat-card social">
              <div className="stat-icon">📱</div>
              <div className="stat-content">
                <p className="stat-label">Social Engagement</p>
                <h3 className="stat-value">Active</h3>
                <span className="stat-change positive">Connected</span>
              </div>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <div className="content-grid">
          {/* Recent Orders */}
          <section className="dashboard-section">
            <div className="section-title">
              <h3>Recent Orders</h3>
              <a href="/admin/orders" className="view-all">View All →</a>
            </div>

            {orders.length > 0 ? (
              <div className="orders-table">
                <div className="table-header">
                  <div className="col-order">Order ID</div>
                  <div className="col-customer">Customer</div>
                  <div className="col-amount">Amount</div>
                  <div className="col-status">Status</div>
                  <div className="col-date">Date</div>
                </div>
                <div className="table-body">
                  {orders.map((order) => (
                    <div key={order.id} className="table-row">
                      <div className="col-order">#{order.id}</div>
                      <div className="col-customer">{order.customer_name || 'Unknown'}</div>
                      <div className="col-amount">₨{order.total_amount?.toLocaleString() || 0}</div>
                      <div className="col-status">
                        <span className={`status-badge status-${order.status}`}>
                          {order.status || 'pending'}
                        </span>
                      </div>
                      <div className="col-date">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="empty-message">No orders yet</p>
            )}
          </section>

          {/* Featured Artworks */}
          <section className="dashboard-section">
            <div className="section-title">
              <h3>Featured Artworks</h3>
              <a href="/admin/artworks" className="view-all">View All →</a>
            </div>

            {artworks.length > 0 ? (
              <div className="artworks-grid">
                {artworks.slice(0, 3).map((artwork) => (
                  <div key={artwork.id} className="artwork-card">
                    <div className="artwork-image">
                      {artwork.image_url ? (
                        <img src={artwork.image_url} alt={artwork.title} />
                      ) : (
                        <div className="image-placeholder">🖼️</div>
                      )}
                      <div className="artwork-overlay">
                        <button className="btn-view">View</button>
                      </div>
                    </div>
                    <div className="artwork-info">
                      <h4>{artwork.title}</h4>
                      <p className="artwork-price">₨{artwork.price?.toLocaleString() || 0}</p>
                      <p className="artwork-artist">{artwork.artist || 'Unknown Artist'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">No artworks yet</p>
            )}
          </section>
        </div>

        {/* Quick Actions */}
        <section className="quick-actions-section">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <a href="/admin/artworks" className="action-btn action-new-artwork">
              <span className="action-icon">➕</span>
              <span className="action-text">Add New Artwork</span>
            </a>
            <button
              onClick={() => setActiveTab('config')}
              className="action-btn action-settings"
            >
              <span className="action-icon">⚙️</span>
              <span className="action-text">Site Configuration</span>
            </button>
            <a href="/admin/reviews" className="action-btn action-reviews">
              <span className="action-icon">⭐</span>
              <span className="action-text">Manage Reviews</span>
            </a>
            <button
              onClick={() => setActiveTab('config')}
              className="action-btn action-social"
            >
              <span className="action-icon">📱</span>
              <span className="action-text">Social Media</span>
            </button>
            <a href="/admin/orders" className="action-btn action-orders">
              <span className="action-icon">📦</span>
              <span className="action-text">View Orders</span>
            </a>
            <a href="/admin/contacts" className="action-btn action-contacts">
              <span className="action-icon">✉️</span>
              <span className="action-text">Messages</span>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>&copy; 2026 Sidra's Brushes N Ink. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;
