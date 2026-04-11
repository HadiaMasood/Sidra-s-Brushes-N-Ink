import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import './ReviewsDisplay.css';

const ReviewsDisplay = () => {
  const { user } = useSelector(state => state.auth || {});
  const [reviews, setReviews] = useState([]);
  const [featuredReviews, setFeaturedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [artworksLoading, setArtworksLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('featured');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [artworkId, setArtworkId] = useState('');
  const [artworks, setArtworks] = useState([]);
  const [editingReview, setEditingReview] = useState(null);

  // Helper to check ownership
  const isOwner = useCallback((review) => {
    // 1. Check if logged in user owns it (by ID or email)
    if (user) {
      if (user.role === 'admin') return true;
      if (review.user_id && review.user_id === user.id) return true;
      if (review.customer_email && review.customer_email === user.email) return true;
    }

    // 2. Check local storage for guest reviews
    try {
      const myReviews = JSON.parse(localStorage.getItem('my_reviews') || '[]');
      if (myReviews.includes(review.id)) return true;
    } catch (e) {
      console.error('Error checking local storage ownership', e);
    }

    return false;
  }, [user]);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);

      // Add timeout to prevent hanging
      const timeout = (ms) => new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), ms)
      );

      const loadWithTimeout = (promise) =>
        Promise.race([promise, timeout(30000)]); // 30 second timeout

      const [featuredRes, allRes] = await Promise.all([
        loadWithTimeout(api.get('/reviews/featured?limit=5')).catch(() => []),
        loadWithTimeout(api.get('/reviews?limit=10')).catch(() => []),
      ]);

      setFeaturedReviews(featuredRes || []);
      setReviews(allRes || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setFeaturedReviews([]);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadArtworks = useCallback(async () => {
    try {
      setArtworksLoading(true);

      // Add timeout
      const timeout = (ms) => new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), ms)
      );

      const response = await Promise.race([
        api.get('/artworks?dropdown=true'),
        timeout(30000) // Increased to 30 seconds
      ]).catch((e) => {
        console.error('Artworks fetch failed or timed out:', e && e.message);
        return null;
      });

      console.log('Artworks response:', response);

      // Normalize possible response shapes and extract an array
      let artworksData = [];
      const payload = response && (response.data || response) ? (response.data || response) : null;

      if (Array.isArray(payload)) {
        artworksData = payload;
      } else if (payload && Array.isArray(payload.data)) {
        artworksData = payload.data;
      } else if (payload && Array.isArray(payload.artworks)) {
        artworksData = payload.artworks;
      } else if (response && Array.isArray(response)) {
        artworksData = response;
      }

      // If still empty, try to fetch from regular artworks endpoint
      if (!artworksData || artworksData.length === 0) {
        console.log('Dropdown empty, trying regular artworks endpoint...');
        try {
          const fallbackResponse = await api.get('/artworks?limit=50');
          const fallbackData = fallbackResponse?.data?.data || fallbackResponse?.data || [];
          if (Array.isArray(fallbackData) && fallbackData.length > 0) {
            artworksData = fallbackData;
            console.log('Loaded artworks from fallback endpoint:', artworksData.length);
          }
        } catch (fallbackError) {
          console.error('Fallback fetch also failed:', fallbackError);
        }
      }

      console.log('Processed artworks:', artworksData.length);
      setArtworks(artworksData);
    } catch (error) {
      console.error('Error loading artworks:', error);
      setArtworks([]);
    } finally {
      setArtworksLoading(false);
    }
  }, []);

  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await api.delete(`/reviews/${reviewId}`);
        // Refresh reviews
        loadReviews();
        // toast.success('Review deleted'); // Assuming toast is available or use alert
      } catch (error) {
        console.error('Failed to delete review:', error);
        alert('Failed to delete review');
      }
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setShowSubmitForm(true);
    // Scroll to form
    const formElement = document.querySelector('.review-form-container');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Only load reviews initially to keep startup fast
    loadReviews();
  }, [loadReviews]);

  const toggleSubmitForm = () => {
    const newState = !showSubmitForm;
    setShowSubmitForm(newState);
    if (newState && artworks.length === 0) {
      loadArtworks();
    }
  };

  return (
    <div className="reviews-display">
      <div className="reviews-header">
        <h2>Customer Reviews</h2>
        <button
          className="btn btn-primary"
          onClick={toggleSubmitForm}
        >
          {showSubmitForm ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      {showSubmitForm && (
        <ReviewSubmissionForm
          artworks={artworks}
          artworksLoading={artworksLoading}
          initialData={editingReview}
          onSuccess={(newReview) => {
            setShowSubmitForm(false);
            setEditingReview(null);

            // If it's a new review, save ID to local storage for guest ownership
            if (newReview && newReview.id && !editingReview) {
              try {
                const myReviews = JSON.parse(localStorage.getItem('my_reviews') || '[]');
                if (!myReviews.includes(newReview.id)) {
                  myReviews.push(newReview.id);
                  localStorage.setItem('my_reviews', JSON.stringify(myReviews));
                }
              } catch (e) {
                console.error('Failed to save review ownership', e);
              }
            }

            loadReviews();
          }}
          onCancel={() => {
            setShowSubmitForm(false);
            setEditingReview(null);
          }}
        />
      )}

      {loading ? (
        <p className="loading">Loading reviews...</p>
      ) : (
        <div className="reviews-container">
          <div className="reviews-tabs">
            <button
              className={`tab ${selectedTab === 'featured' ? 'active' : ''}`}
              onClick={() => setSelectedTab('featured')}
            >
              ⭐ Featured Reviews
            </button>
            <button
              className={`tab ${selectedTab === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedTab('all')}
            >
              All Reviews
            </button>
          </div>

          <div className="reviews-list">
            {selectedTab === 'featured' ? (
              featuredReviews.length > 0 ? (
                featuredReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    featured
                    canEdit={isOwner(review)}
                    onEdit={() => handleEdit(review)}
                    onDelete={() => handleDelete(review.id)}
                  />
                ))
              ) : (
                <p className="no-reviews">No featured reviews yet</p>
              )
            ) : (
              reviews.length > 0 ? (
                reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    canEdit={isOwner(review)}
                    onEdit={() => handleEdit(review)}
                    onDelete={() => handleDelete(review.id)}
                  />
                ))
              ) : (
                <p className="no-reviews">No reviews yet</p>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ReviewCard = ({ review, featured, canEdit, onEdit, onDelete }) => {
  return (
    <div className={`review-card ${featured ? 'featured' : ''}`}>
      {featured && <span className="featured-badge">⭐ Featured</span>}
      <div className="review-header">
        <div className="reviewer-info">
          <h4>{review.customer_name}</h4>
          <p className="review-date">
            {new Date(review.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="review-rating">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < review.rating ? 'star filled' : 'star'}>
              ★
            </span>
          ))}
        </div>
      </div>

      {review.title && <h5 className="review-title">{review.title}</h5>}

      <p className="review-text">{review.comment}</p>

      {review.artwork && (
        <div className="review-artwork">
          <small>About: <strong>{review.artwork.title}</strong></small>
        </div>
      )}

      {/* Edit/Delete Actions */}
      {canEdit && (
        <div className="review-actions" style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onEdit}
            className="btn-text"
            style={{ background: 'none', border: 'none', color: '#B45309', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="btn-text"
            style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const ReviewSubmissionForm = React.memo(({ artworks, artworksLoading, onSuccess, initialData, onCancel }) => {
  const [formData, setFormData] = useState({
    artwork_id: '',
    customer_name: '',
    customer_email: '',
    rating: 5,
    title: '',
    comment: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        artwork_id: initialData.artwork_id || '',
        customer_name: initialData.customer_name || '',
        customer_email: initialData.customer_email || '',
        rating: initialData.rating || 5,
        title: initialData.title || '',
        comment: initialData.comment || '',
      });
    }
  }, [initialData]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      // ensure numeric fields are sent as numbers
      [name]: name === 'rating' || name === 'artwork_id' ? (value === '' ? '' : parseInt(value)) : value,
    }));
  }, []);

  // small helper to add a client-side timeout for the POST request
  const timeout = (ms) => new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), ms)
  );

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Race the POST/PUT against a timeout so the UI doesn't hang indefinitely
      const request = initialData
        ? api.put(`/reviews/${initialData.id}`, formData)
        : api.post('/reviews', formData);

      const response = await Promise.race([
        request,
        timeout(7000), // 7s client-side timeout
      ]);

      setMessage('Review submitted successfully! It will appear after admin approval.');
      setTimeout(() => {
        try {
          // Pass the response data (review object) to onSuccess
          const reviewData = response && (response.data || response.review || response);
          onSuccess(reviewData);
        } catch (err) {
          console.error('onSuccess callback failed:', err);
        }
        setMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error submitting review:', error);
      // Prefer server message when available, otherwise fall back to error.message
      setMessage(error.response?.data?.message || error.message || 'Error submitting review');
    } finally {
      setLoading(false);
    }
  }, [formData, onSuccess]);

  if (artworksLoading) {
    return (
      <div className="review-form-container">
        <h3>Share Your Experience</h3>
        <p className="loading">Loading artworks...</p>
      </div>
    );
  }

  if (artworks.length === 0) {
    return (
      <div className="review-form-container">
        <h3>Share Your Experience</h3>
        <div className="alert error">
          No artworks available. Please check back later!
        </div>
      </div>
    );
  }

  return (
    <div className="review-form-container">
      <h3>{initialData ? 'Edit Your Review' : 'Share Your Experience'}</h3>
      {message && (
        <div className={`alert ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-group">
          <label>Select Artwork *</label>
          <select
            name="artwork_id"
            value={formData.artwork_id}
            onChange={handleChange}
            required
          >
            <option value="">Choose an artwork...</option>
            {artworks.map(art => (
              <option key={art.id} value={art.id}>
                {art.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Your Name *</label>
          <input
            type="text"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Your Email *</label>
          <input
            type="email"
            name="customer_email"
            value={formData.customer_email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Rating *</label>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map(star => (
              <label key={star} className="star-label">
                <input
                  type="radio"
                  name="rating"
                  value={star}
                  checked={formData.rating === star}
                  onChange={handleChange}
                />
                <span className={`star ${star <= formData.rating ? 'filled' : ''}`}>★</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Title (Optional)</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Amazing quality!"
          />
        </div>

        <div className="form-group">
          <label>Your Review *</label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            required
            minLength={10}
            rows={4}
            placeholder="Share your experience with this artwork..."
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Submitting...' : (initialData ? 'Update Review' : 'Submit Review')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            style={{ marginTop: '10px', marginLeft: '10px' }}
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
});

ReviewSubmissionForm.displayName = 'ReviewSubmissionForm';

export default ReviewsDisplay;

