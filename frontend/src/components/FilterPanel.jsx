import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSearchQuery,
  setCategoryFilter,
  setPriceRange,
  setSortBy,
  resetFilters,
} from '../store/filterSlice';
import { FaSearch, FaTimes, FaFilter } from 'react-icons/fa';

const CATEGORIES = [
  'All',
  'Islamic Calligraphy',
  'Name Calligraphy',
  'Nature Art',
  'Cute Aesthetic Cartoon Characters',
  'Tote Bags'
];
const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

export const FilterPanel = ({ onFiltersApply }) => {
  const dispatch = useDispatch();
  const filters = useSelector(state => state.filter);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [tempPriceRange, setTempPriceRange] = useState(filters.priceRange);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    dispatch(setSearchQuery(query));
    onFiltersApply?.();
  };

  const handleCategoryChange = (category) => {
    dispatch(setCategoryFilter(category));
    onFiltersApply?.();
  };

  const handleSortChange = (e) => {
    dispatch(setSortBy(e.target.value));
    onFiltersApply?.();
  };

  const handlePriceRangeChange = (type, value) => {
    const newRange = { ...tempPriceRange, [type]: parseInt(value) };
    setTempPriceRange(newRange);
  };

  const applyPriceFilter = () => {
    dispatch(setPriceRange(tempPriceRange));
    onFiltersApply?.();
  };

  const handleReset = () => {
    dispatch(resetFilters());
    setTempPriceRange({ min: 0, max: 100000 });
    onFiltersApply?.();
  };

  return (
    <>
      {/* Desktop Filter Panel */}
      <div className="hidden md:block bg-white p-6 rounded-lg shadow-md mb-6 space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-body font-semibold mb-2 text-ink-800">Search</label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gold-calligraphy" />
            <input
              type="text"
              placeholder="Search artworks..."
              value={filters.searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-paper-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-calligraphy focus:border-gold-calligraphy font-body"
            />
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-body font-semibold mb-3 text-ink-800">Categories (Updated)</label>
          <div className="space-y-2">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`block w-full text-left px-4 py-2 rounded-sm transition font-body ${filters.categoryFilter === category
                  ? 'bg-gold-calligraphy text-white shadow-md'
                  : 'bg-paper-100 hover:bg-paper-200 text-ink-700'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-body font-semibold mb-3 text-ink-800">Price Range</label>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-ink-600 font-body">Min: Rs. {tempPriceRange.min}</label>
              <input
                type="range"
                min="0"
                max="100000"
                value={tempPriceRange.min}
                onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                className="w-full accent-gold-calligraphy"
              />
            </div>
            <div>
              <label className="text-xs text-ink-600 font-body">Max: Rs. {tempPriceRange.max}</label>
              <input
                type="range"
                min="0"
                max="100000"
                value={tempPriceRange.max}
                onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                className="w-full accent-gold-calligraphy"
              />
            </div>
            <button
              onClick={applyPriceFilter}
              className="w-full bg-gold-calligraphy text-white py-2 rounded-sm font-semibold hover:bg-gold-600 transition font-body shadow-sm"
            >
              Apply Price Filter
            </button>
          </div>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-body font-semibold mb-2 text-ink-800">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={handleSortChange}
            className="w-full px-3 py-2 border border-paper-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-calligraphy focus:border-gold-calligraphy font-body"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="w-full border border-gold-calligraphy text-gold-calligraphy py-2 rounded-sm font-semibold hover:bg-gold-calligraphy hover:text-white transition flex items-center justify-center gap-2 font-body"
        >
          <FaTimes /> Reset Filters
        </button>
      </div>

      {/* Mobile Filter Button */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full bg-gold-calligraphy text-white py-3 rounded-sm font-semibold flex items-center justify-center gap-2 shadow-md font-body"
        >
          <FaFilter /> Filters & Sort
        </button>

        {showMobileFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end animate-fade-in">
            <div className="bg-paper-warm w-full rounded-t-xl p-6 max-h-[80vh] overflow-y-auto shadow-2xl">
              {/* Mobile Filter Content */}
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-paper-200 pb-4">
                  <h3 className="font-heading font-bold text-xl text-ink-900">Filters</h3>
                  <button onClick={() => setShowMobileFilters(false)} className="text-ink-500">
                    <FaTimes />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-body font-semibold mb-2 text-ink-800">Search</label>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={filters.searchQuery}
                    onChange={handleSearchChange}
                    className="w-full px-3 py-2 border border-paper-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-calligraphy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-body font-semibold mb-2 text-ink-800">Category</label>
                  <select
                    value={filters.categoryFilter}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-paper-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-calligraphy"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-body font-semibold mb-2 text-ink-800">Sort</label>
                  <select
                    value={filters.sortBy}
                    onChange={handleSortChange}
                    className="w-full px-3 py-2 border border-paper-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-calligraphy"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    setShowMobileFilters(false);
                    onFiltersApply?.();
                  }}
                  className="w-full bg-gold-calligraphy text-white py-3 rounded-sm font-semibold shadow-md active:scale-95 transition"
                >
                  Apply Results
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
