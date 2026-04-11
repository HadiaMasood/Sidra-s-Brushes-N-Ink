import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import wishlistReducer from './wishlistSlice';
import filterReducer from './filterSlice';
import configReducer from './configSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    filter: filterReducer,
    config: configReducer,
  },
});
