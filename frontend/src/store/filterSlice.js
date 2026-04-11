import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchQuery: '',
  categoryFilter: 'All',
  priceRange: { min: 0, max: 100000 },
  sortBy: 'latest', // latest, price_low, price_high, popular
  filteredResults: [],
};

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setCategoryFilter: (state, action) => {
      state.categoryFilter = action.payload;
    },
    setPriceRange: (state, action) => {
      state.priceRange = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setFilteredResults: (state, action) => {
      state.filteredResults = action.payload;
    },
    resetFilters: (state) => {
      state.searchQuery = '';
      state.categoryFilter = 'All';
      state.priceRange = { min: 0, max: 100000 };
      state.sortBy = 'latest';
      state.filteredResults = [];
    },
  },
});

export const {
  setSearchQuery,
  setCategoryFilter,
  setPriceRange,
  setSortBy,
  setFilteredResults,
  resetFilters,
} = filterSlice.actions;

export default filterSlice.reducer;
