import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity, clearCart } from '../store/cartSlice';
import { orderService, paymentService } from '../services/api';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaWhatsapp, FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import { getArtworkImageUrl } from '../utils/imageUtils';
import '../styles/Checkout.css';


export const CartPage = () => {
  const config = useSelector(state => state.config);
  const cartItems = useSelector(state => state.cart.items);
  const cartTotal = useSelector(state => state.cart.total);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState('bank_transfer');
  const [receiptFile, setReceiptFile] = React.useState(null);

  const handleCheckout = async (data) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('customer_name', data.name);
      formData.append('customer_email', data.email);
      formData.append('customer_phone', data.phone);
      formData.append('customer_address', data.address);
      formData.append('customer_city', data.city);
      formData.append('customer_country', data.country);
      formData.append('payment_method', 'bank_transfer');

      if (receiptFile) {
        formData.append('receipt', receiptFile);
      } else {
        toast.error('Please upload your payment receipt screenshot first.');
        setLoading(false);
        return;
      }

      // Add items as JSON string for FormData handling in backend
      formData.append('items', JSON.stringify(cartItems.map(item => ({
        artwork_id: item.id,
        quantity: item.quantity,
        options: item.selectedType,
      }))));

      console.log('Creating order with FormData...');
      const orderResponse = await orderService.create(formData);
      console.log('Order response:', orderResponse);

      const orderId = orderResponse.id || orderResponse.data?.id;

      toast.success('Order created successfully! Our team will verify your receipt shortly.');
      
      dispatch(clearCart());
      navigate(`/order-success/${orderId}`);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || error.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppOrder = () => {
    const phoneNumber = config.contact?.contact_phone?.replace(/\D/g, '') || '923275693892';
    const advance = cartTotal * 0.5;
    const cod = cartTotal * 0.5;
    const message = `Hi! I'm interested in ordering from Sidra's Brushes N Ink.\n\nOrder Details:\n${cartItems.map(item => {
      const itemPrice = item.finalPrice || item.price;
      return `- ${item.title}: ${item.quantity} x Rs.${itemPrice.toLocaleString()}`;
    }).join('\n')}\n* Framing is available on request. Framing cost will be calculated separately.*\n\nTotal Amount: Rs.${cartTotal.toFixed(2)}\nAdvance Payment (50%): Rs.${advance.toFixed(2)}\nCOD Amount (50%): Rs.${cod.toFixed(2)}`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-serif font-bold mb-4 text-ink-900">Shopping Cart</h1>
        <p className="text-ink-800 text-lg italic">Your cart is empty</p>
        <a href="/gallery" className="inline-block mt-6 bg-rose-200 text-ink-900 px-8 py-2 rounded-sm font-serif tracking-widest uppercase hover:bg-rose-300 transition">
          Continue Shopping
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif font-bold mb-8 text-ink-900">Shopping Cart ({cartItems.length} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            {cartItems.map((item, index) => (
              <div key={`${item.id}-${item.selectedType}`} className={`flex items-center gap-4 p-4 ${index !== cartItems.length - 1 ? 'border-b' : ''}`}>
                <img src={getArtworkImageUrl(item)} alt={item.title} className="w-20 h-20 object-cover rounded" />

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-gold-calligraphy font-serif font-bold italic">
                    Rs. {(item.finalPrice || item.price).toLocaleString()}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    * Framing available on request, cost calculated separately.
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 border rounded px-2 py-1">
                  <button
                    onClick={() => dispatch(updateQuantity({ id: item.id, selectedType: item.selectedType, quantity: Math.max(1, item.quantity - 1) }))}
                    className="text-gold-calligraphy hover:bg-paper-200 p-1"
                  >
                    <FaMinus size={14} />
                  </button>
                  <span className="w-6 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => dispatch(updateQuantity({ id: item.id, selectedType: item.selectedType, quantity: item.quantity + 1 }))}
                    className="text-gold-calligraphy hover:bg-paper-200 p-1"
                  >
                    <FaPlus size={14} />
                  </button>
                </div>

                <div className="text-right">
                  <p className="font-bold text-lg">Rs. {((item.finalPrice || item.price) * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => dispatch(removeFromCart({ id: item.id, selectedType: item.selectedType }))}
                    className="text-red-500 hover:text-red-700 mt-2 flex items-center gap-1"
                  >
                    <FaTrash size={14} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => dispatch(clearCart())}
            className="mt-4 text-red-500 hover:text-red-700 font-semibold"
          >
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg sticky top-20 space-y-4">
            <h2 className="text-2xl font-serif font-bold text-ink-900">Order Summary</h2>

            {/* Breakdown */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Total Amount:</span>
                <span>Rs. {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-rose-600 bg-rose-50 p-2 rounded-sm">
                <span>Advance Payment (50%):</span>
                <span>Rs. {(cartTotal * 0.5).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 italic">
                <span>Remaining (COD):</span>
                <span>Rs. {(cartTotal * 0.5).toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleSubmit(handleCheckout)} className="space-y-3">
              <div>
                <input
                  {...register('name', { required: 'Name is required' })}
                  placeholder="Full Name"
                  className="w-full px-3 py-2 border border-ink-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold-calligraphy bg-white font-serif"
                />
                {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
              </div>

              <div>
                <input
                  {...register('email', { required: 'Email is required' })}
                  type="email"
                  placeholder="Email"
                  className="w-full px-3 py-2 border border-ink-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold-calligraphy bg-white font-serif"
                />
                {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
              </div>

              <div>
                <input
                  {...register('phone', { required: 'Phone is required' })}
                  placeholder="Phone (03001234567)"
                  className="w-full px-3 py-2 border border-ink-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold-calligraphy bg-white font-serif"
                />
                {errors.phone && <span className="text-red-500 text-sm">{errors.phone.message}</span>}
              </div>

              <div>
                <input
                  {...register('address', { required: 'Address is required' })}
                  placeholder="Complete Address"
                  className="w-full px-3 py-2 border border-ink-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold-calligraphy bg-white font-serif"
                />
                {errors.address && <span className="text-red-500 text-sm">{errors.address.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    {...register('city', { required: 'City is required' })}
                    placeholder="City"
                    className="w-full px-3 py-2 border border-ink-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold-calligraphy bg-white font-serif"
                  />
                  {errors.city && <span className="text-red-500 text-sm">{errors.city.message}</span>}
                </div>
                <div>
                  <input
                    {...register('country', { required: 'Country is required' })}
                    placeholder="Country"
                    defaultValue="Pakistan"
                    className="w-full px-3 py-2 border border-ink-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold-calligraphy bg-white font-serif"
                  />
                  {errors.country && <span className="text-red-500 text-sm">{errors.country.message}</span>}
                </div>
              </div>

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
                    { label: 'Account No', value: config.payment?.bank_account_no || '0458-1824-001750-01-8' },
                    { label: 'IBAN', value: config.payment?.iban || 'PK30 BAHL 0458 1824 0017 5001' },
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
                  {receiptFile && <p className="text-xs text-green-600 font-bold mt-2">Selected: {receiptFile.name}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-200 text-ink-900 py-3 rounded-sm font-serif font-bold tracking-widest uppercase hover:bg-rose-300 disabled:opacity-50 transition-all duration-300"
              >
                {loading ? 'Processing...' : 'Complete Checkout'}
              </button>
            </form>

            {/* WhatsApp Order Option */}
            <div className="border-t pt-4">
              <button
                onClick={handleWhatsAppOrder}
                className="w-full bg-green-500 text-white py-3 rounded font-semibold hover:bg-green-600 flex items-center justify-center gap-2 transition"
              >
                <FaWhatsapp /> Order via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
