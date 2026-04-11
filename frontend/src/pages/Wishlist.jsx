import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromWishlist, clearWishlist } from '../store/wishlistSlice';
import { addToCart } from '../store/cartSlice';
import toast from 'react-hot-toast';
import { FaTrash, FaShoppingCart, FaHeart } from 'react-icons/fa';
import { getArtworkImageUrl } from '../utils/imageUtils';

export const WishlistPage = () => {
  const wishlistItems = useSelector(state => state.wishlist.items);
  const dispatch = useDispatch();

  const handleAddToCart = (item) => {
    dispatch(addToCart({ ...item, quantity: 1 }));
    toast.success('Added to cart!');
  };

  const handleRemove = (itemId) => {
    dispatch(removeFromWishlist(itemId));
    toast.success('Removed from wishlist');
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <FaHeart className="mx-auto text-4xl text-gray-300 mb-4" />
        <h1 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h1>
        <p className="text-gray-600 text-lg mb-8">
          Add artworks to your wishlist to save them for later
        </p>
        <a
          href="/gallery"
          className="inline-block bg-ink-900 text-paper-warm px-8 py-3 rounded-sm hover:bg-gold-calligraphy hover:text-ink-900 transition font-serif tracking-widest uppercase"
        >
          Continue Shopping
        </a>
      </div>
    );
  }

  const totalValue = wishlistItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-2 text-ink-900">My Wishlist</h1>
        <p className="text-gray-600">{wishlistItems.length} items • Total Value: Rs. {totalValue.toFixed(2)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Wishlist Items */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wishlistItems.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="relative h-48 overflow-hidden bg-gray-200">
                  <img
                    src={getArtworkImageUrl(item)}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-110 transition duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="bg-[#1C1C1C] text-[#C5A059] p-2 rounded-full hover:bg-black transition border border-[#C5A059]/30"
                      title="Remove from wishlist"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 truncate">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>

                  <div className="flex justify-between items-center mb-3">
                    <span className="font-serif font-bold text-lg text-ink-900">Rs. {parseFloat(item.price).toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full py-2 rounded-sm font-serif font-semibold transition bg-[#C5A059] text-[#1C1C1C] hover:bg-black hover:text-[#C5A059] flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    <FaShoppingCart /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wishlist Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg sticky top-20 space-y-4">
            <h2 className="text-xl font-bold">Wishlist Summary</h2>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Total Items:</span>
                <span className="font-semibold">{wishlistItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Value:</span>
                <span className="font-semibold text-gold-calligraphy">Rs. {totalValue.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                wishlistItems.forEach(item => handleAddToCart(item));
              }}
              className="w-full bg-[#C5A059] text-[#1C1C1C] py-3 rounded-xl font-bold hover:bg-[#1C1C1C] hover:text-[#C5A059] transition flex items-center justify-center gap-2 border border-[#C5A059]/20 shadow-md"
            >
              <FaShoppingCart /> Add All to Cart
            </button>

            <button
              onClick={() => {
                if (window.confirm('Clear entire wishlist?')) {
                  dispatch(clearWishlist());
                  toast.success('Wishlist cleared');
                }
              }}
              className="w-full bg-[#1C1C1C] text-[#C5A059] py-3 rounded-xl font-bold hover:bg-black transition flex items-center justify-center gap-2 border border-[#C5A059]/20"
            >
              <FaTrash /> Clear Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
