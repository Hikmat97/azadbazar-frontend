import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next'; // <--- New Import
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch } from 'react-redux';
import { authApi } from '../../src/api/auth';
import { notificationApi } from '../../src/api/notifications';
import { auth, signInWithEmailAndPassword } from '../../src/services/firebase';
import notificationService from '../../src/services/notification';
import socketService from '../../src/services/socket';
import { setToken, setUser } from '../../src/store/slices/authSlice';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation();

const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert(t('common.error'), t('auth.fillAllFields'));
    return;
  }

  setLoading(true);

  try {
    console.log('🔐 Attempting login...');
    
    // 1. Sign in with Firebase
   
     const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // 2. Get Firebase ID token (Force refresh to get fresh token)
    const firebaseToken = await userCredential.user.getIdToken(true);
    console.log('✅ Firebase token obtained:', firebaseToken.substring(0, 20) + '...');

    // 3. Save token to AsyncStorage
    await AsyncStorage.setItem('userToken', firebaseToken);
    dispatch(setToken(firebaseToken));
    console.log('✅ Token saved to AsyncStorage');
    

    // 4. Get user data from backend - PASS TOKEN DIRECTLY
   

    const userData = await authApi.getMe();
    dispatch(setUser(userData.user));
    

    // 5. Navigate to home
    router.replace('/(tabs)');
    // Connect socket
socketService.connect();

    registerPushNotifications();

  } catch (error) {
    console.error('❌ Login error:', error);
    
  

    let errorMessageKey = 'errors.somethingWentWrong'; // Default fallback (from your errors object)

      if (error.code === 'auth/user-not-found') {
        // Suggested New Key: auth.noAccountFound
        errorMessageKey = 'auth.noAccountFound';
      } else if (error.code === 'auth/wrong-password') {
        // Suggested New Key: auth.incorrectPassword
        errorMessageKey = 'auth.incorrectPassword';
      } else if (error.code === 'auth/invalid-email') {
        // Existing Key: auth.invalidEmail
        errorMessageKey = 'auth.invalidEmail';
      } else if (error.code === 'auth/user-disabled') {
        // Suggested New Key: auth.accountDisabled
        errorMessageKey = 'auth.accountDisabled';
      } else if (error.error) {
        // Use the untranslated API error message for specific backend failures
        errorMessageKey = error.error; 
      } else if (error.message) {
        // Use the untranslated Firebase/network error message as a last resort
        errorMessageKey = error.message; 
      }
      
      // t() might return the key itself, which is fine for raw messages.
      const displayMessage = t(errorMessageKey) === errorMessageKey ? errorMessageKey : t(errorMessageKey);
      
      Alert.alert(t('common.error'), displayMessage);
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
      
      // Send token to backend
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
      <View style={styles.content}>
        {/* Title: "Welcome Back!" -> t('auth.welcomeBack') */}
        <Text style={styles.title}>{t('auth.welcomeBack')}</Text> 
        
        {/* Subtitle: "Login to your account" -> t('auth.loginToAccount') */}
        <Text style={styles.subtitle}>{t('auth.loginToAccount')}</Text> 

        <TextInput
          style={styles.input}
          // Placeholder: "Email" -> t('auth.email')
          placeholder={t('auth.email')} 
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          // Placeholder: "Password" -> t('auth.password')
          placeholder={t('auth.password')} 
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            // Loading text can be localized from 'common.loading' if needed
            <ActivityIndicator color="#fff" /> 
          ) : (
            // Button Text: "Login" -> t('auth.login')
            <Text style={styles.buttonText}>{t('auth.login')}</Text> 
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push('/(auth)/signup')}
          disabled={loading}
        >
          {/* Compound Text: "Don't have an account? Sign Up" */}
          <Text style={styles.link}>
            {/* Base Text: "Don't have an account?" -> t('auth.dontHaveAccount') */}
            {t('auth.dontHaveAccount')} 
            
            <Text style={styles.linkBold}> {t('auth.signup')}</Text>
          </Text>
        </TouchableOpacity>
        
       
        
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
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












