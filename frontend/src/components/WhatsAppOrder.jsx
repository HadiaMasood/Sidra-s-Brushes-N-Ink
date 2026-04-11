import React, { useState } from 'react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import '../styles/WhatsAppOrder.css';

const WhatsAppOrder = ({ cartItems = [], totalAmount = 0, customerEmail = '', customerPhone = '' }) => {
  const config = useSelector(state => state.config);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateOrderMessage = () => {
    const itemsList = cartItems
      .map((item) => `• ${item.name} x${item.quantity} - ₨${item.price}`)
      .join('\n');

    const message = `
🎨 *Sidra's Brushes N Ink Order*

*Items:*
${itemsList}

*Total Amount:* ₨${totalAmount?.toLocaleString() || 0}

*Customer Email:* ${customerEmail || 'Not provided'}
*Customer Phone:* ${customerPhone || 'Not provided'}

Please confirm this order. Thank you! 🙏
    `.trim();

    return encodeURIComponent(message);
  };

  const handleWhatsAppClick = async () => {
    try {
      setLoading(true);

      if (!cartItems || cartItems.length === 0) {
        alert('Your cart is empty. Please add items before placing an order.');
        setLoading(false);
        return;
      }

      // WhatsApp Business Number from config
      const whatsappNumber = config.contact?.contact_phone?.replace(/\D/g, '') || '923275693892';
      const message = generateOrderMessage();

      // Open WhatsApp with pre-filled message
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
      window.open(whatsappUrl, '_blank');

      setShowModal(false);
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      alert('Failed to open WhatsApp. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = () => {
    const message = generateOrderMessage();
    const decodedMessage = decodeURIComponent(message);

    navigator.clipboard.writeText(decodedMessage).then(() => {
      alert('Order details copied! You can paste it in WhatsApp.');
    });
  };

  return (
    <>
      {/* WhatsApp Order Button */}
      <button
        className="whatsapp-order-btn"
        onClick={() => setShowModal(true)}
        title="Order via WhatsApp"
      >
        <FaWhatsapp className="whatsapp-icon" />
        <span className="btn-text">Order via WhatsApp</span>
      </button>

      {/* WhatsApp Modal */}
      {showModal && (
        <div className="whatsapp-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="whatsapp-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-header">
              <div className="header-title">
                <FaWhatsapp className="header-icon" />
                <h2>Order via WhatsApp</h2>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            {/* Content */}
            <div className="modal-content">
              {cartItems && cartItems.length > 0 ? (
                <>
                  {/* Order Summary */}
                  <div className="order-summary">
                    <h3>Order Summary</h3>
                    <div className="items-list">
                      {cartItems.map((item, index) => (
                        <div key={index} className="summary-item">
                          <div className="item-details">
                            <p className="item-name">{item.name}</p>
                            <p className="item-qty">Qty: {item.quantity}</p>
                          </div>
                          <p className="item-price">₨{item.price?.toLocaleString() || 0}</p>
                        </div>
                      ))}
                    </div>
                    <div className="summary-total">
                      <span>Total Amount:</span>
                      <span className="total-price">₨{totalAmount?.toLocaleString() || 0}</span>
                    </div>
                  </div>

                  {/* Message Preview */}
                  <div className="message-preview">
                    <h3>Message Preview</h3>
                    <div className="preview-box">
                      <p>
                        🎨 <strong>Sidra's Brushes N Ink Order</strong>
                      </p>
                      <p>
                        <strong>Items:</strong>
                      </p>
                      {cartItems.map((item, index) => (
                        <p key={index}>
                          • {item.name} x{item.quantity} - ₨{item.price}
                        </p>
                      ))}
                      <p>
                        <strong>Total Amount:</strong> ₨{totalAmount?.toLocaleString() || 0}
                      </p>
                      {customerEmail && (
                        <p>
                          <strong>Email:</strong> {customerEmail}
                        </p>
                      )}
                      {customerPhone && (
                        <p>
                          <strong>Phone:</strong> {customerPhone}
                        </p>
                      )}
                      <p>Please confirm this order. Thank you! 🙏</p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="info-box">
                    <p>
                      💡 <strong>Tips:</strong> Our team will respond within a few minutes. You can also call us directly at
                      <a href={`tel:${config.contact?.contact_phone || '+92-327-5693892'}`}> {config.contact?.contact_phone || '+92-327-5693892'}</a> for faster service.
                    </p>
                  </div>
                </>
              ) : (
                <div className="empty-cart-message">
                  <p>Your cart is empty. Please add items before placing an order.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-copy"
                onClick={handleCopyMessage}
                disabled={!cartItems || cartItems.length === 0}
              >
                Copy Message
              </button>
              <button
                className="btn-send-whatsapp"
                onClick={handleWhatsAppClick}
                disabled={loading || !cartItems || cartItems.length === 0}
              >
                {loading ? 'Opening WhatsApp...' : 'Send on WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Button (Optional) */}
      <a
        href={`https://wa.me/${config.contact?.contact_phone?.replace(/\D/g, '') || '923275693892'}?text=Hello%20Canvas%20and%20Brush!`}
        className="whatsapp-floating-btn"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat with us on WhatsApp"
      >
        <FaWhatsapp />
      </a>
    </>
  );
};

export default WhatsAppOrder;
