




// app/index.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

const LANGUAGE_SELECTED_KEY = '@language_selected';

export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkInitialSetup();
  }, []);

  const checkInitialSetup = async () => {
    try {
      // Add a small delay for splash effect
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if language has been selected
      const languageSelected = await AsyncStorage.getItem(LANGUAGE_SELECTED_KEY);
      
      if (!languageSelected) {
        // First time user - show language selection
        router.replace('/language-selection');
        return;
      }
      
      // Check authentication
      const token = await AsyncStorage.getItem('userToken');
      
      if (token) {
        // User is logged in
        router.replace('/(tabs)');
      } else {
        // User is not logged in
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('Initial setup check error:', error);
      router.replace('/language-selection');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>OLX Clone</Text>
        <ActivityIndicator size="large" color="#FF6B6B" style={styles.loader} />
        <Text style={styles.subtitle}>Loading...</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});