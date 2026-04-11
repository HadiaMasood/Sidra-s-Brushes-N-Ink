import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { orderService, paymentService } from '../services/api';
import { clearCart } from '../store/cartSlice';
import toast from 'react-hot-toast';
import { FaShoppingBag, FaPhone, FaLock } from 'react-icons/fa';
import '../styles/Checkout.css';

export const CheckoutPage = () => {
  const cartItems = useSelector(state => state.cart.items);
  const cartTotal = useSelector(state => state.cart.total);
  const config = useSelector(state => state.config);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const [paymentMethod, setPaymentMethod] = React.useState('bank_transfer');
  const [orderSummary, setOrderSummary] = React.useState(null);
  const [receiptFile, setReceiptFile] = React.useState(null);

  React.useEffect(() => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      navigate('/gallery');
    }
  }, [cartItems, navigate]);

  const handlePlaceOrder = async (data) => {
    try {
      if (!data.terms) {
        toast.error('Please accept terms and conditions');
        return;
      }

      const orderData = {
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone,
        customer_address: data.address,
        customer_city: data.city,
        customer_country: data.country,
        payment_method: paymentMethod,
        notes: data.notes,
        items: cartItems.map(item => ({
          artwork_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      console.log('Creating order with data:', orderData);
      
      // Use FormData if there is a receipt
      const formData = new FormData();
      Object.keys(orderData).forEach(key => {
        if (key === 'items') {
          formData.append(key, JSON.stringify(orderData[key]));
        } else {
          formData.append(key, orderData[key]);
        }
      });
      
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      // We need to update orderService.create to handle FormData
      const response = await orderService.create(formData);
      console.log('Order response:', response);

      // API interceptor already returns .data, so response is the order object
      const orderId = response.id || response.data?.id;

      if (paymentMethod === 'bank_transfer') {
        toast.success('Order placed! Your receipt is uploaded and being verified.');
      } else {
        toast.success('Order placed successfully! We will contact you soon.');
      }

      dispatch(clearCart());
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to place order');
    }
  };

  const shippingCost = cartTotal > 5000 ? 0 : 300;
  const finalTotal = cartTotal + shippingCost;

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Left: Checkout Form */}
        <div className="checkout-form-section">
          <h1 className="checkout-title">Checkout</h1>

          <form onSubmit={handleSubmit(handlePlaceOrder)} className="checkout-form">
            {/* Personal Information */}
            <div className="form-section">
              <h2 className="form-section-title">Delivery Information</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <span className="error">{errors.name.message}</span>}
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    placeholder="your@email.com"
                  />
                  {errors.email && <span className="error">{errors.email.message}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    {...register('phone', { required: 'Phone is required' })}
                    placeholder="+92 300 1234567"
                  />
                  {errors.phone && <span className="error">{errors.phone.message}</span>}
                </div>

                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    {...register('city', { required: 'City is required' })}
                    placeholder="e.g., Karachi"
                  />
                  {errors.city && <span className="error">{errors.city.message}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full">
                  <label>Complete Address *</label>
                  <textarea
                    {...register('address', { required: 'Address is required' })}
                    placeholder="Street address, building number, etc."
                    rows="3"
                  ></textarea>
                  {errors.address && <span className="error">{errors.address.message}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Country *</label>
                <select
                  {...register('country', { required: 'Country is required' })}
                  defaultValue="Pakistan"
                >
                  <option value="Pakistan">Pakistan</option>
                  <option value="UAE">UAE</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                </select>
              </div>
            </div>

            {/* Payment Method */}
            <div className="form-section">
              <h2 className="form-section-title">Payment Method</h2>

              <div className="bank-transfer-details-box">
                <div className="bank-transfer-header">
                  <span className="bank-transfer-icon">🏦</span>
                  <div>
                    <h3 className="bank-transfer-title">Direct Bank Transfer</h3>
                    <p className="bank-transfer-badge">50% Advance Required</p>
                  </div>
                </div>

                <p className="bank-transfer-subtitle">
                  Transfer the 50% advance (or full amount) to the account below, then upload your receipt screenshot.
                </p>

                <div className="bank-info-grid">
                  {[
                    { label: 'Bank', value: config.payment?.bank_name || 'BANK AL HABIB Limited' },
                    { label: 'Account Title', value: config.payment?.bank_account_title || 'SIDRA MASOOD' },
                    { label: 'Account No', value: '0458-1824-001750-01-8' },
                    { label: 'IBAN', value: 'PK30 BAHL 0458 1824 0017 5001' },
                  ].map((row, idx) => (
                    <div key={idx} className="bank-info-row">
                      <span className="bank-label">{row.label}</span>
                      <span className="bank-value">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="receipt-upload-container">
                  <label className="upload-title">📎 Upload Receipt Screenshot *</label>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReceiptFile(e.target.files[0])}
                      required
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Additional Notes */}
            <div className="form-section">
              <h2 className="form-section-title">Additional Notes (Optional)</h2>
              <textarea
                {...register('notes')}
                placeholder="Any special requests or notes about your order..."
                rows="3"
              ></textarea>
            </div>

            {/* Terms & Conditions */}
            <div className="form-section">
              <label className="terms-checkbox">
                <input
                  type="checkbox"
                  {...register('terms', { required: 'You must accept terms' })}
                />
                <span>I agree to the terms & conditions and privacy policy *</span>
              </label>
              {errors.terms && <span className="error">{errors.terms.message}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-place-order"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="checkout-summary-section">
          <div className="order-summary-card">
            <h2 className="summary-title">
              <FaShoppingBag /> Order Summary
            </h2>

            {/* Order Items */}
            <div className="summary-items">
              {cartItems.map((item) => (
                <div key={item.id} className="summary-item">
                  <img src={item.image_url} alt={item.name} />
                  <div className="item-details">
                    <p className="item-name">{item.name}</p>
                    <p className="item-qty">Qty: {item.quantity}</p>
                  </div>
                  <p className="item-price">₨{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Summary Details */}
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₨{cartTotal.toLocaleString()}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span className={shippingCost === 0 ? 'free' : ''}>
                  {shippingCost === 0 ? 'FREE' : `₨${shippingCost}`}
                </span>
              </div>

              <div className="summary-row total">
                <span>Total</span>
                <span>₨{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Security Badge */}
            <div className="security-badge">
              <FaLock /> Secure Payment
            </div>

            {/* Promo Code */}
            <div className="promo-section">
              <input type="text" placeholder="Enter promo code" />
              <button type="button">Apply</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
