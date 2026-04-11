import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaSearch, FaTimes, FaFilter } from 'react-icons/fa';
import '../styles/SearchFilter.css';

const SearchFilter = ({ onSearch, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState('newest');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounce search function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const handleSearchDebounced = useCallback(
    debounce((term) => {
      onSearch(term);
    }, 300),
    [onSearch]
  );

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    handleSearchDebounced(term);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    onFilterChange({
      category,
      priceRange,
      sortBy,
    });
  };

  const handlePriceChange = (e) => {
    const newPrice = [parseInt(e.target.value)];
    setPriceRange(newPrice);
    onFilterChange({
      selectedCategory,
      priceRange: newPrice,
      sortBy,
    });
  };

  const handleSortChange = (e) => {
    const sort = e.target.value;
    setSortBy(sort);
    onFilterChange({
      selectedCategory,
      priceRange,
      sortBy: sort,
    });
  };

  const categories = [
    { id: 'all', label: 'All Artworks', icon: '🎨' },
    { id: 'paintings', label: 'Paintings', icon: '🖼️' },
    { id: 'sketches', label: 'Sketches', icon: '✏️' },
    { id: 'digital', label: 'Digital Art', icon: '💻' },
    { id: 'crafts', label: 'Crafts', icon: '🎭' },
  ];

  return (
    <div className="search-filter-container">
      {/* Search Bar */}
      <div className="search-bar-wrapper">
        <div className="search-input-group">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search artworks, artists..."
            className="search-input"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button className="clear-btn" onClick={handleClearSearch}>
              <FaTimes />
            </button>
          )}
        </div>
        <button
          className="advanced-filter-btn"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <FaFilter />
          <span>Advanced Filters</span>
        </button>
      </div>

      {/* Category Chips */}
      <div className="category-chips">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-chip ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category.id)}
          >
            <span className="chip-icon">{category.icon}</span>
            <span className="chip-label">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="advanced-filters">
          <div className="filter-group">
            <label className="filter-label">Sort By</label>
            <select
              className="filter-select"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="trending">Trending</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">
              Price Range: ₨0 - ₨{priceRange[0]?.toLocaleString() || '100,000'}
            </label>
            <input
              type="range"
              min="0"
              max="100000"
              step="5000"
              value={priceRange[0] || 0}
              onChange={handlePriceChange}
              className="price-slider"
            />
          </div>

          <div className="filter-actions">
            <button
              className="btn-reset-filters"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setPriceRange([0, 100000]);
                setSortBy('newest');
                onSearch('');
                onFilterChange({
                  category: 'all',
                  priceRange: [0, 100000],
                  sortBy: 'newest',
                });
              }}
            >
              Reset Filters
            </button>
            <button
              className="btn-close-filters"
              onClick={() => setShowAdvanced(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
