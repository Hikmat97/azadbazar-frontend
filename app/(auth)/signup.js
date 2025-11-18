import socketService from '../../src/services/socket';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch } from 'react-redux';
import { authApi } from '../../src/api/auth';
import { notificationApi } from '../../src/api/notifications';
import { auth, createUserWithEmailAndPassword } from '../../src/services/firebase';
import notificationService from '../../src/services/notification';
import { setToken, setUser } from '../../src/store/slices/authSlice';

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

 const handleSignup = async () => {
  if (!validateForm()) return;

  setLoading(true);

  try {
    // 1. Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      formData.email, 
      formData.password
    );
    
    console.log('✅ Firebase user created:', userCredential.user.uid);

    // 2. Get Firebase ID token (IMPORTANT: Force refresh)
    const firebaseToken = await userCredential.user.getIdToken(true);
    console.log('✅ Firebase token obtained:', firebaseToken.substring(0, 20) + '...');

    // 3. Save token to AsyncStorage
    await AsyncStorage.setItem('userToken', firebaseToken);
    dispatch(setToken(firebaseToken));
    console.log('✅ Token saved to AsyncStorage');

    // 4. Register user in backend - PASS TOKEN DIRECTLY
    try {
      const registerResponse = await authApi.register({
        firebaseUid: userCredential.user.uid,
        email: formData.email,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber
      }, firebaseToken);
      console.log('✅ Backend registration successful:', registerResponse);
    } catch (backendError) {
      console.error('❌ Backend registration error:', backendError);
      // Continue anyway if user already exists
    }

    // 5. Get user data from backend - PASS TOKEN DIRECTLY
    // const userData = await authApi.getMe(firebaseToken);
    // console.log('✅ User data fetched:', userData);
    // dispatch(setUser(userData.user));
     const userData = await authApi.getMe();
    dispatch(setUser(userData.user));

    // 6. Navigate to home
    router.replace('/(tabs)');

    socketService.connect();
    registerPushNotifications();


  } catch (error) {
    console.error('❌ Signup error:', error);
    
    // Better error messages
    let errorMessage = 'Signup failed';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    Alert.alert('Error', errorMessage);
  } finally {
    setLoading(false);
  }
};
const registerPushNotifications = async () => {
  try {
    console.log('📲 Registering for push notifications...');
    
    const token = await notificationService.registerForPushNotifications();
    
    if (token) {
      console.log('✅ Got push token:', token);
      
      const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';
      await notificationApi.registerToken(token, deviceType);
      
      console.log('✅ Push token registered with backend');
    }
  } catch (error) {
    console.error('❌ Error registering push notifications:', error);
  }
};
return (
<KeyboardAvoidingView
behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
style={styles.container}
>
<ScrollView contentContainerStyle={styles.scrollContent}>
<View style={styles.content}>
<Text style={styles.title}>Create Account</Text>
<Text style={styles.subtitle}>Sign up to get started</Text>      <TextInput
        style={styles.input}
        placeholder="Full Name *"
        value={formData.fullName}
        onChangeText={(text) => handleChange('fullName', text)}
        editable={!loading}
      />      <TextInput
        style={styles.input}
        placeholder="Email *"
        value={formData.email}
        onChangeText={(text) => handleChange('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />      <TextInput
        style={styles.input}
        placeholder="Phone Number (Optional)"
        value={formData.phoneNumber}
        onChangeText={(text) => handleChange('phoneNumber', text)}
        keyboardType="phone-pad"
        editable={!loading}
      />      <TextInput
        style={styles.input}
        placeholder="Password *"
        value={formData.password}
        onChangeText={(text) => handleChange('password', text)}
        secureTextEntry
        editable={!loading}
      />      <TextInput
        style={styles.input}
        placeholder="Confirm Password *"
        value={formData.confirmPassword}
        onChangeText={(text) => handleChange('confirmPassword', text)}
        secureTextEntry
        editable={!loading}
      />      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>      <TouchableOpacity 
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text style={styles.link}>
          Already have an account? <Text style={styles.linkBold}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
</KeyboardAvoidingView>
);
}const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#fff'
},
scrollContent: {
flexGrow: 1
},
content: {
flex: 1,
justifyContent: 'center',
padding: 20
},
title: {
fontSize: 32,
fontWeight: 'bold',
marginBottom: 8,
color: '#333'
},
subtitle: {
fontSize: 16,
color: '#666',
marginBottom: 32
},
input: {
borderWidth: 1,
borderColor: '#ddd',
borderRadius: 8,
padding: 16,
marginBottom: 16,
fontSize: 16
},
button: {
backgroundColor: '#FF6B6B',
padding: 16,
borderRadius: 8,
alignItems: 'center',
marginTop: 8
},
buttonDisabled: {
opacity: 0.6
},
buttonText: {
color: '#fff',
fontSize: 16,
fontWeight: '600'
},
link: {
textAlign: 'center',
marginTop: 16,
color: '#666',
fontSize: 14
},
linkBold: {
color: '#FF6B6B',
fontWeight: '600'
}
});