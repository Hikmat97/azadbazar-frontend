import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import '../src/locales/i18n'; // Initialize i18n
import notificationService from '../src/services/notification';
import { persistor, store } from '../src/store';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    notificationService.setupNotificationListeners(
      handleNotificationReceived,
      handleNotificationClicked
    );
  }, []);

  const handleNotificationReceived = (notification) => {
    console.log('🔔 Notification received in app:', notification);
  };

  const handleNotificationClicked = (response) => {
    const data = response.notification.request.content.data;
    console.log('👆 Notification clicked:', data);

    switch (data.type) {
      case 'new_message':
        if (data.conversationId) {
          router.push(`/chat/${data.conversationId}`);
        }
        break;

      case 'new_offer':
        if (data.conversationId) {
          router.push(`/chat/${data.conversationId}`);
        } else if (data.listingId) {
          router.push(`/listing/${data.listingId}`);
        }
        break;

      case 'listing_sold':
      case 'listing_favorited':
      case 'listing_expiring':
      case 'price_drop':
        if (data.listingId) {
          router.push(`/listing/${data.listingId}`);
        }
        break;

      default:
        router.push('/(tabs)');
    }
  };

  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        }
        persistor={persistor}
      >
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  }
});
