import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  categories: [],
  selectedCategory: null,
  loading: false,
  error: null
};

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setCategories: (state, action) => {
      state.categories = action.payload;
      state.loading = false;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  setCategories,
  setSelectedCategory,
  setLoading,
  setError,
  clearError
} = categorySlice.actions;

export default categorySlice.reducer;