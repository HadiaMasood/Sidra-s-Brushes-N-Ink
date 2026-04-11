import React from 'react';
import { FaTimes, FaShoppingCart, FaHeart, FaRegHeart, FaStar, FaEye, FaWhatsapp, FaFacebookF, FaLink } from 'react-icons/fa';
import '../styles/ProductDetailsModal.css';
import { getArtworkImageUrl } from '../utils/imageUtils';
import { ProductSchema, SEO, BreadcrumbSchema } from './SEO';

export const ProductDetailsModal = ({ product, isOpen, onClose, onAddToCart, onWishlistToggle, isInWishlist, onImageZoom }) => {
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [selectedType, setSelectedType] = React.useState('Canvas');

  // Memoize images to prevent re-renders and handle duplication
  const allImages = React.useMemo(() => {
    if (!product) return [];

    const rawImages = [
      { url: getArtworkImageUrl(product), alt: product?.title || '', id: 'primary' },
      ...(product.images || []).map(img => ({
        url: getArtworkImageUrl(img),
        alt: img.alt_text || product?.title || '',
        id: img.id
      }))
    ];

    // Deduplicate by URL
    const unique = [];
    const seen = new Set();

    rawImages.forEach(img => {
      if (img.url && !seen.has(img.url)) {
        seen.add(img.url);
        unique.push(img);
      }
    });

    return unique;
  }, [product]);

  // Set initial selected image when product changes
  React.useEffect(() => {
    if (product) {
      setSelectedImage(getArtworkImageUrl(product));
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const images = product.images || [];

  // Calculate price
  const getPrice = () => {
    return product.price;
  };

  const currentPrice = getPrice();

  const handleBackdropClick = (e) => {
    if (e.target.className === 'product-modal-backdrop') {
      onClose();
    }
  };

  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://sidrabni.com';
  const productUrl = `${siteUrl}/gallery/${product.id}`;

  return (
    <div className="product-modal-backdrop" onClick={handleBackdropClick}>
      <SEO
        title={`${product.title} | Sidra's Brushes N Ink`}
        description={product.description}
        image={getArtworkImageUrl(product)}
        url={productUrl}
        type="product"
      />
      <ProductSchema product={product} />
      <BreadcrumbSchema items={[
        { name: 'Home', url: siteUrl },
        { name: 'Gallery', url: `${siteUrl}/gallery` },
        { name: product.category?.name || product.category || 'Artwork', url: `${siteUrl}/gallery?category=${encodeURIComponent(product.category?.name || product.category || '')}` },
        { name: product.title, url: productUrl }
      ]} />
      <div className="product-modal-content">
        {/* Close Button */}
        <button className="product-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="product-modal-body">
          {/* Left: Image & Gallery */}
          <div className="product-modal-image-section">
            <div className="product-modal-main-view">
              <div className="product-modal-image-wrapper">
                <img
                  src={selectedImage}
                  alt={product.title}
                  className="product-modal-image"
                />
              </div>

              {/* Thumbnail Gallery */}
              {allImages.length > 1 && (
                <div className="product-modal-gallery">
                  {allImages.map((img) => (
                    <button
                      key={img.id}
                      className={`gallery-thumb ${selectedImage === img.url ? 'active' : ''}`}
                      onClick={() => setSelectedImage(img.url)}
                    >
                      <img src={img.url} alt={img.alt} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div className="product-modal-details-section">
            {/* Breadcrumbs (Visual) */}
            <nav className="text-xs text-gray-500 mb-2 flex flex-wrap gap-1 items-center">
              <span>Home</span> <span>&rsaquo;</span>
              <span>Gallery</span> <span>&rsaquo;</span>
              <span className="text-gold-600 font-medium">{product.category?.name || product.category}</span>
            </nav>

            {/* Title */}
            <h2 className="product-modal-title">{product.title}</h2>

            {/* Category & Stats */}
            <div className="product-modal-meta">
              <span className="category-badge">{product.category?.name || product.category}</span>
              <div className="stats">
                <span className="stat-item">
                  <FaEye /> {product.views || 0} Views
                </span>
                <span className="stat-item">
                  📊 {product.sales || 0} Sold
                </span>
              </div>
            </div>

            <div className="product-modal-price">
              <span className="price">₨{currentPrice.toLocaleString()}</span>
              {product.original_price && product.original_price > product.price && (
                <span className="original-price">₨{product.original_price.toLocaleString()}</span>
              )}
            </div>

            {/* Description */}
            <div className="product-modal-description">
              <h4>About this artwork</h4>
              <p>{product.description}</p>
            </div>

            {/* Details */}
            <div className="product-modal-specs">
              {product.medium && (
                <div className="spec">
                  <span className="spec-label">Medium:</span>
                  <span className="spec-value">{product.medium}</span>
                </div>
              )}
              {product.dimensions && (
                <div className="spec">
                  <span className="spec-label">Dimensions:</span>
                  <span className="spec-value">{product.dimensions}</span>
                </div>
              )}
              {product.year_created && (
                <div className="spec">
                  <span className="spec-label">Year:</span>
                  <span className="spec-value">{product.year_created}</span>
                </div>
              )}
              {product.stock !== undefined && (
                <div className="spec">
                  <span className="spec-label">Availability:</span>
                  <span className={`spec-value ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                  </span>
                </div>
              )}
            </div>

            {/* Rating (if available) */}
            {product.rating && (
              <div className="product-modal-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < Math.floor(product.rating) ? 'filled' : 'empty'}
                    />
                  ))}
                </div>
                <span className="rating-text">{product.rating}/5.0</span>
              </div>
            )}

            {/* Framing Information Note */}
            <div className="product-modal-options py-4 border-y border-gray-100 my-4">
              <p className="text-gold-calligraphy text-sm font-medium italic">
                Framing is available on request. The framing cost will be calculated separately based on size and current material prices.
              </p>
            </div>

            {/* Actions */}
            <div className="product-modal-actions">
              <button
                className="btn-add-to-cart"
                onClick={() => {
                  onAddToCart(selectedType);
                  onClose();
                }}
                disabled={product.stock === 0}
              >
                <FaShoppingCart /> Add to Cart
              </button>
              <button
                className={`btn-wishlist ${isInWishlist ? 'active' : ''}`}
                onClick={() => onWishlistToggle()}
              >
                {isInWishlist ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>

            {/* Share Info */}
            <div className="product-modal-share">
              <p className="share-label">Share this artwork:</p>
              <div className="share-buttons">
                <button
                  className="share-btn whatsapp"
                  onClick={() => window.open(`https://wa.me/?text=Check out this amazing artwork: ${product.title} - ${productUrl}`, '_blank')}
                  title="Share on WhatsApp"
                >
                  <FaWhatsapp />
                </button>
                <button
                  className="share-btn facebook"
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, '_blank')}
                  title="Share on Facebook"
                >
                  <FaFacebookF />
                </button>
                <button
                  className="share-btn copy-link"
                  onClick={() => {
                    navigator.clipboard.writeText(productUrl);
                    // You might want to show a toast here, using alert for simplicity or existing toast if available
                    alert('Link copied to clipboard!');
                  }}
                  title="Copy Link"
                >
                  <FaLink />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
