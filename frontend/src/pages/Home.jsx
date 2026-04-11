import React from 'react';
import { useArtworks } from '../hooks/useArtworks';
import { ArtworkCard, Hero } from '../components/Common';
import ReviewsDisplay from '../components/ReviewsDisplay';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import toast from 'react-hot-toast';
import { ProductDetailsModal } from '../components/ProductDetailsModal';
import { artworkService } from '../services/api';
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';
import { SEO, OrganizationSchema, WebsiteSchema, LocalBusinessSchema, FAQSchema, BreadcrumbSchema } from '../components/SEO';

export const HomePage = () => {
  const filters = React.useMemo(() => ({ featured: 'true', limit: 4 }), []);
  const { artworks, loading, error } = useArtworks(1, filters);
  const dispatch = useDispatch();
  const wishlistItems = useSelector(state => state.wishlist.items);

  const [selectedArtwork, setSelectedArtwork] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [detailedArtwork, setDetailedArtwork] = React.useState(null);

  const isInWishlist = (id) => wishlistItems.some(item => item.id === id);

  const handleAddToCart = (artwork, type = 'Canvas') => {
    dispatch(addToCart({ ...artwork, quantity: 1, selectedType: type }));
    toast.success(`Added ${type} version to cart!`);
  };

  const handleWishlistToggle = (artwork) => {
    if (isInWishlist(artwork.id)) {
      dispatch(removeFromWishlist(artwork.id));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlist(artwork));
      toast.success('Added to wishlist!');
    }
  };

  const handleQuickView = async (artwork) => {
    setSelectedArtwork(artwork);
    setIsModalOpen(true);
    setDetailedArtwork(null);

    try {
      const response = await artworkService.getById(artwork.id);
      if (response && response.artwork) {
        setDetailedArtwork(response.artwork);
      }
    } catch (error) {
      console.error('Error fetching artwork details:', error);
      setDetailedArtwork(artwork);
    }
  };

  // Fallback artworks if API fails
  const fallbackArtworks = [
    {
      id: 1,
      title: 'Moonlight Dreams',
      description: 'A serene abstract composition with cool tones and flowing shapes.',
      price: 5500,
      image_path: 'https://images.unsplash.com/photo-1578321272176-e3ae3be98d58?w=500',
    },
    {
      id: 2,
      title: 'Mountain Serenity',
      description: 'Majestic mountain landscape with golden hour lighting.',
      price: 7200,
      image_path: 'https://images.unsplash.com/photo-1579783902614-e3fb5141b0cb?w=500',
    },
    {
      id: 3,
      title: 'Classic Elegance',
      description: 'A striking portrait capturing emotion and character.',
      price: 8500,
      image_path: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500',
    },
    {
      id: 4,
      title: 'Wildflower Garden',
      description: 'Delicate botanical illustration of wildflowers in full bloom.',
      price: 4200,
      image_path: 'https://images.unsplash.com/photo-1578321272176-e3ae3be98d58?w=500',
    },
  ];

  // Show fallback immediately if loading takes too long or if there's an error
  const displayArtworks = artworks && artworks.length > 0 ? artworks : (loading ? [] : fallbackArtworks);
  const showLoading = loading && artworks.length === 0;

  return (
    <>
      <SEO
        title="Sidra's Brushes N Ink - Authentic Art Gallery & E-Commerce"
        description="Discover beautiful handcrafted paintings, sketches, and artworks at Sidra's Brushes N Ink. Authentic traditional pieces for your collection."
      />
      <OrganizationSchema />
      <WebsiteSchema />
      <LocalBusinessSchema />
      <FAQSchema />
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://sidrabni.com" },
        { name: "Gallery", url: "https://sidrabni.com/gallery" }
      ]} />

      <div className="min-h-screen font-body relative">
        {/* Content Wrapper - Relative to sit above background */}
        <div className="relative z-10">
          <Hero logo="https://images.unsplash.com/photo-1579783902614-e3fb5141b0cb?w=200" />
          <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-serif font-extrabold text-ink-primary mb-4 relative inline-block">
                Featured Artworks
                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gold-accent rounded-full"></span>
              </h2>
              <p className="text-ink-secondary italic mt-4 font-semibold text-lg">Curated pieces for your collection</p>
            </div>

            {error && !loading && artworks.length === 0 && (
              <p className="text-center text-gold-600 mb-4">Note: Using demo data (API connection issue)</p>
            )}

            {showLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
                <p className="mt-4 text-ink-secondary">Loading masterpiece...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayArtworks.map(artwork => (
                  <ArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    onAddToCart={handleAddToCart}
                    onWishlistToggle={handleWishlistToggle}
                    isInWishlist={isInWishlist(artwork.id)}
                    onQuickView={handleQuickView}
                  />
                ))}
              </div>
            )}
          </div>

          <ProductDetailsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            product={detailedArtwork || selectedArtwork}
            onAddToCart={(type) => handleAddToCart(detailedArtwork || selectedArtwork, type)}
            onWishlistToggle={() => handleWishlistToggle(detailedArtwork || selectedArtwork)}
            isInWishlist={isInWishlist((detailedArtwork || selectedArtwork)?.id)}
            onImageZoom={() => { }}
          />

          {/* Reviews Section - kept transparent to show ink background */}
          <div className="py-16 mt-8 relative">
            <div className="absolute inset-0 bg-transparent opacity-50 -z-10"></div>
            <ReviewsDisplay />
          </div>
        </div>
      </div>
    </>
  );
};
