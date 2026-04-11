import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  total: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;

      const itemPrice = item.price;

      const existingItem = state.items.find(i => i.id === item.id && i.selectedType === item.selectedType);

      if (existingItem) {
        existingItem.quantity += item.quantity || 1;
      } else {
        state.items.push({
          ...item,
          quantity: item.quantity || 1,
          selectedType: item.selectedType || 'Canvas',
          finalPrice: itemPrice, // Store calculated price
          basePrice: item.price // Store original price
        });
      }

      state.total = state.items.reduce((sum, i) => {
        const price = i.finalPrice || i.price;
        return sum + (price * i.quantity);
      }, 0);

      // Persist to localStorage
      localStorage.setItem('cart', JSON.stringify(state));
    },
    removeFromCart: (state, action) => {
      const { id, selectedType } = action.payload;
      state.items = state.items.filter(i => !(i.id === id && i.selectedType === selectedType));
      state.total = state.items.reduce((sum, i) => {
        const price = i.finalPrice || i.price;
        return sum + (price * i.quantity);
      }, 0);

      // Persist to localStorage
      localStorage.setItem('cart', JSON.stringify(state));
    },
    updateQuantity: (state, action) => {
      const { id, selectedType, quantity } = action.payload;
      const item = state.items.find(i => i.id === id && i.selectedType === selectedType);
      if (item) {
        item.quantity = quantity;
      }
      state.total = state.items.reduce((sum, i) => {
        const price = i.finalPrice || i.price;
        return sum + (price * i.quantity);
      }, 0);

      // Persist to localStorage
      localStorage.setItem('cart', JSON.stringify(state));
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;

      // Clear localStorage
      localStorage.removeItem('cart');
    },
    loadCartFromStorage: (state, action) => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          state.items = parsed.items || [];
          state.total = parsed.total || 0;
        } catch (error) {
          console.error('Error loading cart from storage:', error);
        }
      }
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, loadCartFromStorage } = cartSlice.actions;
export default cartSlice.reducer;
