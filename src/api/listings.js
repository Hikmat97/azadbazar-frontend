

import apiClient from './client';

export const listingApi = {
  getAll: (params = {}) => {
    console.log('📝 Fetching listings with params:', params);
    return apiClient.get('/listings', { params });
  },
  
  getById: (id) => {
    console.log('📝 Fetching listing:', id);
    return apiClient.get(`/listings/${id}`);
  },
  
  create: (data) => {
    console.log('📝 Creating listing');
    return apiClient.post('/listings', data);
  },
  
  update: (id, data) => {
    console.log('📝 Updating listing:', id);
    return apiClient.put(`/listings/${id}`, data);
  },
  
  delete: (id) => {
    console.log('📝 Deleting listing:', id);
    return apiClient.delete(`/listings/${id}`);
  },
  
  markAsSold: (id) => {
    console.log('📝 Marking as sold:', id);
    return apiClient.patch(`/listings/${id}/sold`);
  },
  
  getMyListings: (status = 'active') => {
    console.log('📝 Fetching my listings');
    return apiClient.get('/listings/user/my-listings', { params: { status } });
  },
  
  toggleFavorite: (listingId) => {
    console.log('📝 Toggling favorite:', listingId);
    return apiClient.post(`/listings/${listingId}/favorite`);
  },
  
  getFavorites: () => {
    console.log('📝 Fetching favorites');
    return apiClient.get('/listings/user/favorites');
  }
};