import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  listings: [],
  featuredListings: [],
  selectedListing: null,
  myListings: [],
  favorites: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  }
};

const listingSlice = createSlice({
  name: 'listing',
  initialState,
  reducers: {
    setListings: (state, action) => {
      state.listings = action.payload;
      state.loading = false;
    },
    setFeaturedListings: (state, action) => {
      state.featuredListings = action.payload;
    },
    setSelectedListing: (state, action) => {
      state.selectedListing = action.payload;
      state.loading = false;
    },
    setMyListings: (state, action) => {
      state.myListings = action.payload;
    },
    setFavorites: (state, action) => {
      state.favorites = action.payload;
    },
    setPagination: (state, action) => {
      state.pagination = action.payload;
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
    },
    addListing: (state, action) => {
      state.listings.unshift(action.payload);
      state.myListings.unshift(action.payload);
    },
    toggleFavoriteInList: (state, action) => {
      const listingId = action.payload;
      const listing = state.listings.find(l => l.id === listingId);
      if (listing) {
        listing.isFavorite = !listing.isFavorite;
      }
    }
  }
});

export const {
  setListings,
  setFeaturedListings,
  setSelectedListing,
  setMyListings,
  setFavorites,
  setPagination,
  setLoading,
  setError,
  clearError,
  addListing,
  toggleFavoriteInList
} = listingSlice.actions;

export default listingSlice.reducer;