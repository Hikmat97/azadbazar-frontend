import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next'; // <-- ADD THIS IMPORT
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { listingApi } from '../../src/api/listings';
import { notificationApi } from '../../src/api/notifications';
import { auth, signOut } from '../../src/services/firebase';
import notificationService from '../../src/services/notification';
import socketService from '../../src/services/socket';
import { persistor } from '../../src/store';
import { logout } from '../../src/store/slices/authSlice';

export default function ProfileScreen() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const router = useRouter();
  const [myListingsCount, setMyListingsCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load stats when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading profile stats...');
      
      const [listingsResponse, favoritesResponse] = await Promise.all([
        listingApi.getMyListings(),
        listingApi.getFavorites()
      ]);
      
      console.log('✅ Listings count:', listingsResponse.listings.length);
      console.log('✅ Favorites count:', favoritesResponse.favorites.length);
      
      setMyListingsCount(listingsResponse.listings.length);
      setFavoritesCount(favoritesResponse.favorites.length);
    } catch (error) {
      console.error('❌ Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚪 Logging out...');

              const pushToken = notificationService.getExpoPushToken();
              if (pushToken) {
                try {
                  await notificationApi.deleteToken(pushToken);
                } catch (error) {
                  console.error('Failed to deactivate push token:', error);
                }
              }

              await signOut(auth);
              await AsyncStorage.removeItem('userToken');
              socketService.disconnect();
              dispatch(logout());
              await persistor.purge();
              
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  const menuItems = [
    {
      icon: 'list',
      title: 'My Ads',
      subtitle: `${myListingsCount} active ads`,
      onPress: () => router.push('/listing/my-listings')
    },
    {
      icon: 'heart',
      title: 'Favorites',
      subtitle: `${favoritesCount} saved items`,
      onPress: () => router.push('/user/favorites')
    },
    {
      icon: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage notification settings',
      onPress: () => router.push('/user/notification-settings')
    },
    {
      icon: 'person',
      title: 'Edit Profile',
      subtitle: 'Update your information',
      onPress: () => router.push('/user/edit-profile')
    },
    {
      icon: 'settings',
      title: 'Settings',
      subtitle: 'App preferences',
      onPress: () => router.push('/user/settings')
    }
  ];

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <Ionicons name="person-circle" size={80} color="#FF6B6B" />
          )}
        </View>
        <Text style={styles.name}>{user?.fullName || 'User'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
        
        {user?.phoneNumber && (
          <View style={styles.phone}>
            <Ionicons name="call" size={14} color="#666" />
            <Text style={styles.phoneText}>{user.phoneNumber}</Text>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{myListingsCount}</Text>
          <Text style={styles.statLabel}>Ads</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{favoritesCount}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.rating || '0.0'}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon} size={24} color="#FF6B6B" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#fff',
    padding: 30,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  avatarContainer: {
    marginBottom: 16
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  phone: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  phoneText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 12,
    paddingVertical: 20
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 13,
    color: '#666'
  },
  statDivider: {
    width: 1,
    backgroundColor: '#eee'
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 20
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  menuContent: {
    flex: 1
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#999'
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    margin: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  }
});