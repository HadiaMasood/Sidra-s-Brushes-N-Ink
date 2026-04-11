import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { artworkService } from '../../services/api';

export const fetchArtworks = createAsyncThunk(
  'artworks/fetchArtworks',
  async (params, { rejectWithValue }) => {
    try {
      const response = await artworkService.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch artworks');
    }
  }
);

export const fetchArtworkById = createAsyncThunk(
  'artworks/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await artworkService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch artwork');
    }
  }
);

export const createArtwork = createAsyncThunk(
  'artworks/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await artworkService.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create artwork');
    }
  }
);

export const updateArtwork = createAsyncThunk(
  'artworks/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await artworkService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update artwork');
    }
  }
);

export const deleteArtwork = createAsyncThunk(
  'artworks/delete',
  async (id, { rejectWithValue }) => {
    try {
      await artworkService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete artwork');
    }
  }
);

const initialState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
  filters: {
    category: null,
    priceRange: [0, 50000],
    search: '',
  },
};

const artworkSlice = createSlice({
  name: 'artworks',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchArtworks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArtworks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchArtworks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch by ID
      .addCase(fetchArtworkById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchArtworkById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchArtworkById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createArtwork.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Update
      .addCase(updateArtwork.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteArtwork.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});

export const { setFilters, clearError } = artworkSlice.actions;
export default artworkSlice.reducer;
