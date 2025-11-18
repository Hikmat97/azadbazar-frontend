import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';

import authReducer from './slices/authSlice';
import categoryReducer from './slices/categorySlice';
import chatReducer from './slices/chatSlice';
import listingReducer from './slices/listingSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist auth state
};

// Auth persist config (persist everything in auth)
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
};

// Combine reducers
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  category: categoryReducer,
  listing: listingReducer,
  chat: chatReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);
// persistor.subscribe(() => {
//   const state = store.getState();
//   console.log('💾 Persisted state updated:', {
//     hasUser: !!state.auth.user,
//     hasToken: !!state.auth.token,
//     userEmail: state.auth.user?.email
//   });
// });

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);