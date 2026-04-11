import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaBox, FaCheckCircle, FaHourglassHalf, FaTruck } from 'react-icons/fa';
import '../styles/OrderTracking.css';

const OrderTracking = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await fetch(`/api/orders/${orderId}`);
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockOrder = {
        id: orderId || '12345',
        status: 'shipping',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        customer: {
          name: 'Ahmed Hassan',
          email: 'ahmed@example.com',
          phone: '+92-300-1234567'
        },
        shipping: {
          address: '123 Art Street, Lahore, Pakistan',
          city: 'Lahore',
          country: 'Pakistan',
          zip: '54000'
        },
        items: [
          {
            id: 1,
            artwork_name: 'Abstract Landscape',
            quantity: 1,
            price: 15000,
            image: 'https://via.placeholder.com/100'
          }
        ],
        total: 15000,
        subtotal: 14000,
        shipping_fee: 1000,
        payment_method: 'Credit Card',
        tracking_number: 'TRK-2024-001234',
        timeline: [
          {
            status: 'Order Placed',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            completed: true
          },
          {
            status: 'Payment Confirmed',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            completed: true
          },
          {
            status: 'Preparing',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            completed: true
          },
          {
            status: 'Shipped',
            date: new Date(),
            completed: true
          },
          {
            status: 'Out for Delivery',
            date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            completed: false
          },
          {
            status: 'Delivered',
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            completed: false
          }
        ]
      };

      setOrder(mockOrder);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      pending: '#ffa500',
      processing: '#3b82f6',
      shipping: '#667eea',
      delivered: '#10b981',
      cancelled: '#ef4444'
    };
    return statusMap[status] || '#666';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaHourglassHalf />;
      case 'processing':
        return <FaBox />;
      case 'shipping':
        return <FaTruck />;
      case 'delivered':
        return <FaCheckCircle />;
      default:
        return <FaBox />;
    }
  };

  if (loading) {
    return (
      <div className="order-tracking-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-tracking-page">
        <div className="error-message">
          <p>Error loading order: {error || 'Order not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-tracking-page">
      <div className="tracking-container">
        {/* Header */}
        <div className="tracking-header">
          <h1>Order Tracking</h1>
          <p className="order-id">Order ID: {order.id}</p>
        </div>

        {/* Status Overview */}
        <div className="status-overview">
          <div className="status-badge" style={{ borderColor: getStatusColor(order.status) }}>
            <span className="status-icon" style={{ color: getStatusColor(order.status) }}>
              {getStatusIcon(order.status)}
            </span>
            <div>
              <p className="status-label">Current Status</p>
              <p className="status-value" style={{ color: getStatusColor(order.status) }}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </p>
            </div>
          </div>

          <div className="tracking-info">
            <div className="info-item">
              <p className="info-label">Tracking Number</p>
              <p className="info-value">{order.tracking_number}</p>
            </div>
            <div className="info-item">
              <p className="info-label">Order Date</p>
              <p className="info-value">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="timeline-section">
          <h2>Order Timeline</h2>
          <div className="timeline">
            {order.timeline.map((event, index) => (
              <div
                key={index}
                className={`timeline-item ${event.completed ? 'completed' : 'pending'}`}
              >
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <p className="timeline-status">{event.status}</p>
                  <p className="timeline-date">
                    {event.date.toLocaleDateString()} {event.date.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="tracking-content">
          {/* Order Items */}
          <div className="order-items-section">
            <h2>Order Items</h2>
            <div className="order-items">
              {order.items.map((item) => (
                <div key={item.id} className="order-item">
                  <img src={item.image} alt={item.artwork_name} />
                  <div className="item-details">
                    <p className="item-name">{item.artwork_name}</p>
                    <p className="item-qty">Quantity: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    <p className="price">₨{item.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="info-section">
            <div className="info-box">
              <h3>Customer Information</h3>
              <div className="info-group">
                <p className="label">Name</p>
                <p className="value">{order.customer.name}</p>
              </div>
              <div className="info-group">
                <p className="label">Email</p>
                <p className="value">{order.customer.email}</p>
              </div>
              <div className="info-group">
                <p className="label">Phone</p>
                <p className="value">{order.customer.phone}</p>
              </div>
            </div>

            <div className="info-box">
              <h3>Shipping Address</h3>
              <div className="info-group">
                <p className="label">Address</p>
                <p className="value">{order.shipping.address}</p>
              </div>
              <div className="info-group">
                <p className="label">City, Country</p>
                <p className="value">
                  {order.shipping.city}, {order.shipping.country}
                </p>
              </div>
              <div className="info-group">
                <p className="label">Postal Code</p>
                <p className="value">{order.shipping.zip}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary-section">
          <h2>Order Summary</h2>
          <div className="summary-box">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₨{order.subtotal?.toLocaleString() || order.total.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className="free">₨{order.shipping_fee || 0}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₨{order.total.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Payment Method</span>
              <span>{order.payment_method}</span>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="support-section">
          <h3>Need Help?</h3>
          <p>If you have any questions about your order, please contact our support team.</p>
          <button className="btn-contact-support">Contact Support</button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
