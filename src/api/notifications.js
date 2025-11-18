import apiClient from './client';

export const notificationApi = {
  registerToken: (token, deviceType) => {
    console.log('📝 Registering push token');
    return apiClient.post('/notifications/register', { token, deviceType });
  },
  
  deleteToken: (token) => {
    console.log('📝 Deleting push token');
    return apiClient.post('/notifications/delete', { token });
  }
};