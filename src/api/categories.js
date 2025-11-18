import apiClient from './client';

export const categoryApi = {
  getAll: () => {
    console.log('📝 Fetching all categories');
    return apiClient.get('/categories');
  },
  
  getById: (id) => {
    console.log('📝 Fetching category:', id);
    return apiClient.get(`/categories/${id}`);
  }
};