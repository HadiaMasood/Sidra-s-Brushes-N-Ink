import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: JSON.parse(localStorage.getItem('wishlist') || '[]'),
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const item = action.payload;
      const exists = state.items.find(i => i.id === item.id);
      if (!exists) {
        state.items.push(item);
        localStorage.setItem('wishlist', JSON.stringify(state.items));
      }
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    },
    clearWishlist: (state) => {
      state.items = [];
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    },
    isInWishlist: (state, action) => {
      return state.items.some(item => item.id === action.payload);
    },
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist, isInWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
