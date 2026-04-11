import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';
import toast from 'react-hot-toast';
import { FaTimes, FaHeart, FaRegHeart, FaShoppingCart, FaEye, FaShareAlt } from 'react-icons/fa';
import { getArtworkImageUrl } from '../utils/imageUtils';

export const ProductModal = ({ product, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector(state => state.wishlist.items);
  const [quantity, setQuantity] = React.useState(1);

  const [selectedImage, setSelectedImage] = React.useState(null);

  React.useEffect(() => {
    if (product) {
      setSelectedImage(getArtworkImageUrl(product));
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const images = product.images || [];
  const allImages = [
    { url: getArtworkImageUrl(product), alt: product.title, id: 'primary' },
    ...images.filter(img => img.image_path !== product.image_path).map(img => ({
      url: getArtworkImageUrl(img),
      alt: img.alt_text || product.title,
      id: img.id
    }))
  ];

  // If we have distinct images (sometimes primary is duplicated in images array depending on backend response)
  // Let's deduplicate by URL
  const uniqueImages = Array.from(new Map(allImages.map(img => [img.url, img])).values());

  const isInWishlist = wishlistItems.some(item => item.id === product.id);

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity }));
    toast.success(`Added ${quantity} to cart!`);
    setQuantity(1);
  };

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlist(product));
      toast.success('Added to wishlist!');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      });
    } else {
      toast.success('Link copied to clipboard!');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-12 lg:inset-20 bg-white rounded-lg z-50 overflow-y-auto">
        <div className="p-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="float-right text-gray-500 hover:text-gray-700 text-2xl"
          >
            <FaTimes />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 clear-right">
            {/* Image */}
            <div>
              <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg mb-4">
                <img
                  src={selectedImage || getArtworkImageUrl(product)}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails */}
              {uniqueImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                  {uniqueImages.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img.url)}
                      className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition ${selectedImage === img.url ? 'border-amber-600' : 'border-transparent hover:border-gray-300'
                        }`}
                    >
                      <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleWishlistToggle}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-100 transition"
                >
                  {isInWishlist ? <FaHeart /> : <FaRegHeart />}
                  {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-600 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  <FaShareAlt /> Share
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.title}</h1>
                <p className="text-gray-600 text-lg">By {product.artist || 'Anonymous'}</p>
              </div>

              {/* Price */}
              <div className="border-b pb-4">
                <p className="text-4xl font-bold text-amber-600">Rs. {parseFloat(product.price).toFixed(2)}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold">{product.views || 0}</p>
                  <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <FaEye /> Views
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{product.sales || 0}</p>
                  <p className="text-sm text-gray-600">Sold</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{product.reviews_count || 0}</p>
                  <p className="text-sm text-gray-600">Reviews</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-bold text-lg mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Dimensions & Details */}
              {product.dimensions && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Specifications</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Dimensions:</span> {product.dimensions}</p>
                    <p><span className="text-gray-600">Medium:</span> {product.medium || 'Mixed Media'}</p>
                    <p><span className="text-gray-600">Category:</span> {product.category || 'Art'}</p>
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Quantity:</span>
                  <div className="flex items-center border rounded">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-amber-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-amber-700 transition flex items-center justify-center gap-2"
                >
                  <FaShoppingCart /> Add to Cart
                </button>

                <button
                  onClick={onClose}
                  className="w-full border-2 border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
