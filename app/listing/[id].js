import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSelector } from 'react-redux';
import { listingApi } from '../../src/api/listings';

const { width } = Dimensions.get('window');

export default function ListingDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useSelector(state => state.auth);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const isOwner = user && listing && user.id === listing.seller.id;

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
  try {
    setLoading(true);
    const response = await listingApi.getById(id);
    setListing(response.listing);
    
    // Set favorite status from backend
    setIsFavorite(response.listing.isFavorite || false);
  } catch (error) {
    console.error('Error loading listing:', error);
    Alert.alert('Error', 'Failed to load listing');
  } finally {
    setLoading(false);
  }
};

  const handleToggleFavorite = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to save favorites');
      return;
    }

    try {
      setFavoriteLoading(true);
      const response = await listingApi.toggleFavorite(id);
      setIsFavorite(response.isFavorite);
      
      Alert.alert(
        'Success',
        response.isFavorite ? 'Added to favorites' : 'Removed from favorites'
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `Rs ${parseFloat(price).toLocaleString()}`;
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    return 'Just now';
  };

  const handleMoreOptions = () => {
    Alert.alert(
      'Manage Ad',
      'Choose an action',
      [
        {
          text: 'Edit',
          onPress: () => router.push(`/listing/edit/${listing.id}`)
        },
        {
          text: 'Mark as Sold',
          onPress: handleMarkAsSold
        },
        {
          text: 'Delete',
          onPress: handleDelete,
          style: 'destructive'
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const handleMarkAsSold = async () => {
    Alert.alert(
      'Mark as Sold',
      'Are you sure you want to mark this item as sold?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Sold',
          onPress: async () => {
            try {
              await listingApi.markAsSold(listing.id);
              Alert.alert('Success', 'Ad marked as sold');
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to mark as sold');
            }
          }
        }
      ]
    );
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Ad',
      'Are you sure you want to delete this ad? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await listingApi.delete(listing.id);
              Alert.alert('Success', 'Ad deleted successfully');
              router.replace('/(tabs)');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete ad');
            }
          }
        }
      ]
    );
  };

  const handleChat = async () => {
    if (!listing?.seller?.id) {
      Alert.alert('Error', 'Cannot start chat');
      return;
    }

    if (user && user.id === listing.seller.id) {
      Alert.alert('Notice', 'This is your own listing');
      return;
    }

    try {
      const { chatApi } = require('../../src/api/chat');
      const { useDispatch } = require('react-redux');
      const { updateConversation } = require('../../src/store/slices/chatSlice');
      
      console.log('🔄 Creating/Getting conversation...');
      
      const response = await chatApi.getOrCreateConversation(
        listing.seller.id,
        listing.id
      );

      console.log('✅ Conversation ready:', response.conversation);

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 100));

      router.push(`/chat/${response.conversation.id}`);
    } catch (error) {
      console.error('❌ Start chat error:', error);
      Alert.alert('Error', 'Failed to start chat');
    }
  };

  const handleCall = () => {
    Alert.alert('Call', `Call ${listing?.seller?.phoneNumber || 'seller'}`);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.error}>
        <Text>Listing not found</Text>
      </View>
    );
  }

  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : ['https://via.placeholder.com/400x300?text=No+Image'];

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
          >
            {images.map((image, index) => (
              <Image 
                key={index}
                source={{ uri: image }} 
                style={styles.image} 
              />
            ))}
          </ScrollView>
          
          {/* Image Indicator */}
          {images.length > 1 && (
            <View style={styles.imageIndicator}>
              <Text style={styles.imageIndicatorText}>
                {currentImageIndex + 1} / {images.length}
              </Text>
            </View>
          )}

          {/* Header Buttons */}
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>

            <View style={styles.headerRightButtons}>
              {/* Favorite Button */}
              {!isOwner && (
                <TouchableOpacity 
                  style={styles.favoriteButton}
                  onPress={handleToggleFavorite}
                  disabled={favoriteLoading}
                >
                  {favoriteLoading ? (
                    <ActivityIndicator size="small" color="#FF6B6B" />
                  ) : (
                    <Ionicons 
                      name={isFavorite ? "heart" : "heart-outline"} 
                      size={24} 
                      color={isFavorite ? "#FF6B6B" : "#333"} 
                    />
                  )}
                </TouchableOpacity>
              )}

              {/* More Options (only for owner) */}
              {isOwner && (
                <TouchableOpacity 
                  style={styles.moreButton}
                  onPress={handleMoreOptions}
                >
                  <Ionicons name="ellipsis-vertical" size={24} color="#333" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Price & Title */}
        <View style={styles.content}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(listing.price)}</Text>
            {listing.condition && (
              <View style={styles.conditionBadge}>
                <Text style={styles.conditionText}>{listing.condition}</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.title}>{listing.title}</Text>
          
          {/* Location & Time */}
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Ionicons name="location" size={16} color="#666" />
              <Text style={styles.metaText}>{listing.location}, {listing.city}</Text>
            </View>
            <Text style={styles.time}>{timeAgo(listing.createdAt)}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{listing.description}</Text>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{listing.category?.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Condition</Text>
            <Text style={styles.detailValue}>{listing.condition}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Views</Text>
            <Text style={styles.detailValue}>{listing.views}</Text>
          </View>
        </View>

        {/* Seller Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seller Information</Text>
          <TouchableOpacity 
            style={styles.sellerCard}
            onPress={() => router.push(`/user/${listing.seller.id}`)}
          >
            <View style={styles.sellerAvatar}>
              {listing.seller.avatar ? (
                <Image source={{ uri: listing.seller.avatar }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={30} color="#666" />
              )}
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{listing.seller.fullName}</Text>
              <View style={styles.rating}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {listing.seller.rating || 0} (0 reviews)
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Buttons - Only show if not owner */}
      {!isOwner && (
        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.callButton]}
            onPress={handleCall}
          >
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.chatButton]}
            onPress={handleChat}
          >
            <Ionicons name="chatbubble" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Chat</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  imageContainer: {
    width: width,
    height: 300,
    backgroundColor: '#f0f0f0'
  },
  image: {
    width: width,
    height: 300,
    resizeMode: 'cover'
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  imageIndicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  headerButtons: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  headerRightButtons: {
    flexDirection: 'row',
    gap: 8
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  content: {
    padding: 20
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginRight: 12
  },
  conditionBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  conditionText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4
  },
  time: {
    fontSize: 13,
    color: '#999'
  },
  section: {
    padding: 20,
    borderTopWidth: 8,
    borderTopColor: '#f5f5f5'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  detailLabel: {
    fontSize: 15,
    color: '#666'
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    textTransform: 'capitalize'
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  sellerInfo: {
    flex: 1
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ratingText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 6
  },
  callButton: {
    backgroundColor: '#4CAF50'
  },
  chatButton: {
    backgroundColor: '#FF6B6B'
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  }
});