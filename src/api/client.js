// // import { API_BASE_URL } from '@env';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';

// const apiClient = axios.create({
//   baseURL: "http://localhost:5000/api",
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// // Request interceptor
// apiClient.interceptors.request.use(
//   async (config) => {
//     const token = await AsyncStorage.getItem('userToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor
// apiClient.interceptors.response.use(
//   (response) => response.data,
//   (error) => {
//     if (error.response) {
//       console.error('API Error:', error.response.data);
//       return Promise.reject(error.response.data);
//     }
//     return Promise.reject(error);
//   }
// );

// export default apiClient;




import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CONFIG from '../config/config';

const apiClient = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('📤 Sending request with token:', token.substring(0, 20) + '...');
      } else {
        console.log('⚠️ No token found in AsyncStorage');
      }
    } catch (error) {
      console.error('❌ Error getting token:', error);
    }
    
    console.log(`📡 API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response.data;
  },
  (error) => {
    if (error.response) {
      console.error(`❌ API Error: ${error.response.status}`, error.response.data);
      return Promise.reject(error.response.data);
    }
    console.error('❌ Network Error:', error.message);
    return Promise.reject(error);
  }
);

export default apiClient;