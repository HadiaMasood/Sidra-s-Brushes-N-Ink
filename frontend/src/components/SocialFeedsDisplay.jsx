import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './SocialFeedsDisplay.css';

const SocialFeedsDisplay = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [config, setConfig] = useState({});

  useEffect(() => {
    loadFeeds();
    loadConfig();
  }, []);

  const loadFeeds = async () => {
    try {
      setLoading(true);
      const response = await api.get('/social-feeds');
      setFeeds(response || []);
    } catch (error) {
      console.error('Error loading social feeds:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const response = await api.get('/config');
      setConfig(response || {});
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const filteredFeeds = filter === 'all' 
    ? feeds 
    : feeds.filter(f => f.platform === filter);

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'instagram':
        return '📷';
      case 'facebook':
        return '👍';
      case 'twitter':
        return '𝕏';
      default:
        return '📱';
    }
  };

  return (
    <div className="social-feeds-display">
      <div className="feeds-header">
        <h2>Our Social Media</h2>
        <p className="subtitle">Follow us for latest updates and inspiration</p>
      </div>

      <div className="social-links">
        {config.instagram_url && (
          <a 
            href={config.instagram_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link instagram"
          >
            📷 Instagram
          </a>
        )}
        {config.facebook_url && (
          <a 
            href={config.facebook_url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link facebook"
          >
            f Facebook
          </a>
        )}
        {config.twitter_url && (
          <a 
            href={config.twitter_url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link twitter"
          >
            𝕏 Twitter
          </a>
        )}
        {config.youtube_url && (
          <a 
            href={config.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link youtube"
          >
            ▶️ YouTube
          </a>
        )}
        {config.tiktok_url && (
          <a 
            href={config.tiktok_url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link tiktok"
          >
            🎵 TikTok
          </a>
        )}
      </div>

      <div className="feeds-filters">
        <button
          className={`filter ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Feeds
        </button>
        <button
          className={`filter ${filter === 'instagram' ? 'active' : ''}`}
          onClick={() => setFilter('instagram')}
        >
          📷 Instagram
        </button>
        <button
          className={`filter ${filter === 'facebook' ? 'active' : ''}`}
          onClick={() => setFilter('facebook')}
        >
          f Facebook
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <p>Loading social feeds...</p>
        </div>
      ) : filteredFeeds.length === 0 ? (
        <div className="no-feeds">
          <p>No social media feeds yet. Follow us on social media!</p>
        </div>
      ) : (
        <div className="feeds-grid">
          {filteredFeeds.map((feed) => (
            <FeedCard key={feed.id} feed={feed} getPlatformIcon={getPlatformIcon} />
          ))}
        </div>
      )}
    </div>
  );
};

const FeedCard = ({ feed, getPlatformIcon }) => {
  return (
    <div className="feed-card">
      <div className="feed-platform">
        <span className="platform-icon">{getPlatformIcon(feed.platform)}</span>
        <span className="platform-name">{feed.platform.charAt(0).toUpperCase() + feed.platform.slice(1)}</span>
        <span className="feed-date">
          {new Date(feed.posted_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>

      <div className="feed-content">
        <p className="content-text">{feed.content}</p>
      </div>

      {feed.metadata?.media_url && (
        <div className="feed-media">
          <img src={feed.metadata.media_url} alt="Post" />
        </div>
      )}

      <div className="feed-stats">
        <div className="stat">
          <span className="icon">❤️</span>
          <span className="count">{feed.likes}</span>
        </div>
        <div className="stat">
          <span className="icon">💬</span>
          <span className="count">{feed.comments_count}</span>
        </div>
      </div>

      {feed.comments && feed.comments.length > 0 && (
        <div className="feed-comments">
          <h4>Top Comments</h4>
          <div className="comments-list">
            {feed.comments.slice(0, 3).map((comment, idx) => (
              <div key={idx} className="comment-item">
                <strong className="comment-author">{comment.username}</strong>
                <p className="comment-text">{comment.text}</p>
              </div>
            ))}
          </div>
          {feed.comments.length > 3 && (
            <p className="more-comments">+{feed.comments.length - 3} more comments</p>
          )}
        </div>
      )}

      {feed.metadata?.permalink && (
        <a 
          href={feed.metadata.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="view-post-btn"
        >
          View on {feed.platform.charAt(0).toUpperCase() + feed.platform.slice(1)}
        </a>
      )}
    </div>
  );
};

export default SocialFeedsDisplay;
