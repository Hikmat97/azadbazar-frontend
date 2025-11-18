import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import {
    createUserWithEmailAndPassword,
    getReactNativePersistence,
    initializeAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import CONFIG from '../config/config';

// Use hardcoded Firebase config
const firebaseConfig = CONFIG.FIREBASE;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export {
    auth, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut
};

