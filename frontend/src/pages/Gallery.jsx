import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useArtworks } from '../hooks/useArtworks';
import { ArtworkCard } from '../components/Common';
import { FilterPanel } from '../components/FilterPanel';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';
import toast from 'react-hot-toast';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { getArtworkImageUrl } from '../utils/imageUtils';
import { ProductDetailsModal } from '../components/ProductDetailsModal';
import { artworkService } from '../services/api';
import { SEO, BreadcrumbSchema } from '../components/SEO';

export const GalleryPage = () => {
  const { branding = {}, payment = {} } = useSiteConfig();
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [selectedArtwork, setSelectedArtwork] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [detailedArtwork, setDetailedArtwork] = React.useState(null);


  // Handle deep linking for product modal
  useEffect(() => {
    if (id) {
      const openArtworkFromUrl = async () => {
        try {
          // Attempt to find inside current artworks list first to save a call, 
          // but if pagination is used, it might not be there. Use API directly.
          const response = await artworkService.getById(id);
          if (response && response.artwork) {
            setDetailedArtwork(response.artwork);
            setSelectedArtwork(response.artwork);
            setIsModalOpen(true);
          }
        } catch (error) {
          console.error('Error fetching artwork from URL:', error);
          toast.error('Artwork not found');
          navigate('/gallery', { replace: true });
        }
      };

      openArtworkFromUrl();
    } else {
      // If no ID in URL, ensure modal is closed
      setIsModalOpen(false);
    }
  }, [id, navigate]);

  // Get filter state from Redux
  const filters = useSelector(state => state.filter);
  const wishlistItems = useSelector(state => state.wishlist.items);

  // Map filters to API params
  const apiFilters = React.useMemo(() => ({
    search: filters.searchQuery,
    category: filters.categoryFilter,
    min_price: filters.priceRange.min,
    max_price: filters.priceRange.max,
    sort: filters.sortBy
  }), [filters]);

  const { artworks, loading, pagination, error, hasFetched, refetch } = useArtworks(page, apiFilters);
  const dispatch = useDispatch();

  // Listen for artwork changes from admin panel
  React.useEffect(() => {
    const handleArtworkChange = (event) => {
      console.log('Artwork changed, refreshing gallery...', event.detail);
      // Clear cache and refetch
      if (refetch) {
        refetch();
      }
    };

    window.addEventListener('artworkDeleted', handleArtworkChange);
    window.addEventListener('artworkUpdated', handleArtworkChange);
    window.addEventListener('artworkCreated', handleArtworkChange);

    return () => {
      window.removeEventListener('artworkDeleted', handleArtworkChange);
      window.removeEventListener('artworkUpdated', handleArtworkChange);
      window.removeEventListener('artworkCreated', handleArtworkChange);
    };
  }, [refetch]);

  // Default branding
  const brandName = branding?.brand_name || "Sidra's Brushes N Ink";

  // Fallback artworks if API fails
  const fallbackArtworks = [
    {
      id: 1,
      title: 'Islamic Calligraphy Piece',
      description: 'Beautiful handcrafted Islamic calligraphy.',
      price: 5500,
      image_path: 'https://images.unsplash.com/photo-1578321272176-e3ae3be98d58?w=500',
      category: { name: 'Islamic Calligraphy' },
    },
    {
      id: 2,
      title: 'Nature Art Piece',
      description: 'Majestic landscape with golden hour lighting.',
      price: 7200,
      image_path: 'https://images.unsplash.com/photo-1579783902614-e3fb5141b0cb?w=500',
      category: { name: 'Nature Art' },
    },
    {
      id: 3,
      title: 'Cartoon Character Mini Canvas',
      description: 'Cute aesthetic cartoon character painting.',
      price: 850,
      image_path: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500',
      category: { name: 'Cute Aesthetic Cartoon Characters' },
    },
    {
      id: 4,
      title: 'Hand-Painted Tote Bag',
      description: 'Stylish and artistic tote bag.',
      price: 1500,
      image_path: 'https://images.unsplash.com/photo-1578321272176-e3ae3be98d58?w=500',
      category: { name: 'Tote Bags' },
    },
  ];

  // Determine what to display: API results if loaded, fallback only if API failed or hasn't loaded yet
  const displayArtworks = (artworks && (artworks.length > 0 || hasFetched)) ? artworks : fallbackArtworks;

  // Apply filters to artworks (Client side fallback/sorting)
  const filteredArtworks = useMemo(() => {
    let result = [...displayArtworks];

    // Hide deleted artworks (soft deleted)
    result = result.filter(art => !art.deleted_at);

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(art =>
        art.title.toLowerCase().includes(query) ||
        art.description.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.categoryFilter && filters.categoryFilter !== 'All') {
      const selectedCat = filters.categoryFilter.toLowerCase().replace(/[\/\s]/g, '');
      result = result.filter(art => {
        const catObj = typeof art.category === 'object' ? art.category : null;
        const catName = catObj?.name || art.category_name || (typeof art.category === 'string' ? art.category : '');

        if (!catName) return false;

        const normalizedArtCat = catName.toLowerCase().replace(/[\/\s]/g, '');
        return normalizedArtCat === selectedCat;
      });
    }

    // Price range filter
    result = result.filter(art =>
      art.price >= filters.priceRange.min &&
      art.price <= filters.priceRange.max
    );

    // Sorting
    switch (filters.sortBy) {
      case 'price_low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'latest':
      default:
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return result;
  }, [displayArtworks, filters]);

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
    setDetailedArtwork(null); // Clear previous

    // Update URL to reflect selected product
    navigate(`/gallery/${artwork.id}`, { replace: false });

    try {
      // Trigger real view on backend
      const response = await artworkService.getById(artwork.id);
      if (response && response.artwork) {
        setDetailedArtwork(response.artwork);
      }
    } catch (error) {
      console.error('Error fetching artwork details:', error);
      setDetailedArtwork(artwork); // Fallback to provided data
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate('/gallery', { replace: false }); // Reset URL
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title={`${brandName} Gallery - Exclusive Artworks`}
        description={`Explore the exclusive collection of handcrafted paintings and calligraphy at ${brandName}. Buy original artworks from talented artists.`}
        url="https://sidrabni.com/gallery"
      />
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://sidrabni.com" },
        { name: "Gallery", url: "https://sidrabni.com/gallery" }
      ]} />
      <h1 className="text-4xl font-serif font-bold mb-8 text-ink-900">{brandName} Gallery</h1>

      {/* Filter Panel */}
      <FilterPanel onFiltersApply={() => setPage(1)} />

      {/* Results Count */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-600">
          Showing <span className="font-bold">{filteredArtworks.length}</span> artwork{filteredArtworks.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading && displayArtworks.length === 0 ? (
        <p className="text-center py-12">Loading artworks...</p>
      ) : filteredArtworks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No artworks found matching your criteria</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {filteredArtworks.map(artwork => (
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

          {/* Product Details Modal */}
          <ProductDetailsModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            product={detailedArtwork || selectedArtwork}
            onAddToCart={(type) => handleAddToCart(detailedArtwork || selectedArtwork, type)}
            onWishlistToggle={() => handleWishlistToggle(detailedArtwork || selectedArtwork)}
            isInWishlist={isInWishlist((detailedArtwork || selectedArtwork)?.id)}
            onImageZoom={() => { }}
          />

          {pagination?.last_page > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: pagination.last_page }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 rounded-sm transition font-serif ${page === i + 1 ? 'bg-ink-900 text-paper-warm' : 'border border-ink-800 text-ink-800 hover:bg-paper-100'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
