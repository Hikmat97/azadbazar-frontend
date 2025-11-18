import apiClient from './client';

export const authApi = {
  register: (data, token) => {
    if (token) {
      return apiClient.post('/auth/register', data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return apiClient.post('/auth/register', data);
  },
  
  getMe: (token) => {
    if (token) {
      return apiClient.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return apiClient.get('/auth/me');
  },
  
  updateProfile: (data) => apiClient.put('/auth/profile', data)
};