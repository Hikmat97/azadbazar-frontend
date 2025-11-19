// Configuration file with hardcoded values
// TODO: Move to environment variables before production

const CONFIG = {
  // Backend API URL
  // For physical device: use your computer's local IP
  // For emulator: use localhost or 10.0.2.2 (Android)
  API_BASE_URL: 'http://10.76.190.124:5000/api', // Change to YOUR local IP
  
  // Firebase Configuration
  FIREBASE: {
 apiKey: "AIzaSyAtbdokxAX3ouIex7csKdajCohJpog6qNk",
  authDomain: "first-5d86b.firebaseapp.com",
  projectId: "first-5d86b",
  storageBucket: "first-5d86b.firebasestorage.app",
  messagingSenderId: "24230511818",
  appId: "1:24230511818:web:b10e7a816f0840f5e26033",
  measurementId: "G-FP4ZPGR4VB"
  },

  
  // Cloudinary Configuration
  CLOUDINARY: {
    cloudName: "ddhshiy07",
    uploadPreset: "kankoryar"
  },
  
  
  // Socket.io URL
  SOCKET_URL: 'http://10.76.190.124:5000/', // Change to YOUR local IP
  
  // App Configuration
  APP_NAME: 'azadbazar',
  IS_DEV: true,
};

export default CONFIG;