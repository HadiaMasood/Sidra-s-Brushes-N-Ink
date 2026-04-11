import { useState, useEffect, useRef } from 'react';
import { artworkService } from '../services/api';

// Simple in-memory cache for artwork queries during the session
const artworksCache = new Map();

export const useArtworks = (page = 1, filters = {}) => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  const abortControllerRef = useRef(null);

  const fetchArtworks = async () => {
    try {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const params = { page, ...filters };
      const cacheKey = JSON.stringify(params);

      // If cached, use it immediately for snappy UI, but still refresh in background
      if (artworksCache.has(cacheKey)) {
        try {
          setArtworks(artworksCache.get(cacheKey));
        } catch (e) { }
        setLoading(false);
      } else {
        setLoading(true);
      }

      // Add timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }, 30000); // 30 second timeout

      // Pass AbortController signal to allow axios to cancel the request
      const response = await artworkService.getAll(params, abortControllerRef.current ? { signal: abortControllerRef.current.signal } : {});

      clearTimeout(timeoutId);

      // Handle paginated response
      if (response && response.data && Array.isArray(response.data)) {
        setArtworks(response.data);
        artworksCache.set(cacheKey, response.data);
        setPagination({
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
        });
      } else if (Array.isArray(response)) {
        // Handle direct array response
        setArtworks(response);
        artworksCache.set(cacheKey, response);
      } else {
        console.warn('useArtworks: Unexpected response format, setting empty array');
        setArtworks([]);
        artworksCache.set(cacheKey, []);
      }

      setHasFetched(true);
      setError(null);
    } catch (err) {
      setHasFetched(true);
      if (err.name === 'AbortError' || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        console.log('useArtworks: Request aborted or canceled');
        return;
      }
      setError(err.message);
      console.error('useArtworks: Error fetching artworks:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterString = JSON.stringify(filters);

  useEffect(() => {
    fetchArtworks();

    return () => {
      // Cleanup: abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [page, filterString]); // Use filterString to properly compare filters

  // Refetch when page becomes visible (user returns from admin)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && hasFetched) {
        fetchArtworks();
      }
    };

    // Listen for artwork events from admin panel
    const handleArtworkChange = (event) => {
      console.log('Artwork change event received:', event.type, event.detail);
      // Clear cache to force fresh data
      artworksCache.clear();
      fetchArtworks();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('artworkDeleted', handleArtworkChange);
    window.addEventListener('artworkUpdated', handleArtworkChange);
    window.addEventListener('artworkCreated', handleArtworkChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('artworkDeleted', handleArtworkChange);
      window.removeEventListener('artworkUpdated', handleArtworkChange);
      window.removeEventListener('artworkCreated', handleArtworkChange);
    };
  }, [hasFetched]);

  return { artworks, loading, error, pagination, hasFetched, refetch: fetchArtworks };
};

export const useArtwork = (id) => {
  const [artwork, setArtwork] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchArtwork = async () => {
      try {
        setLoading(true);
        const response = await artworkService.getById(id);

        let payload = response;
        if (response && response.data) payload = response.data;

        // Extract artwork object
        let art = payload.artwork || payload;
        if (art && art.artwork) art = art.artwork;

        setArtwork(art || null);
        setReviews(payload.reviews || payload.review || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  return { artwork, reviews, loading, error };
};
