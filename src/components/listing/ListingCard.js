import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ListingCard({ listing, onPress, onFavoritePress }) {
  const firstImage = listing.images && listing.images.length > 0 
    ? listing.images[0] 
    : 'https://via.placeholder.com/300x200?text=No+Image';

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

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(listing)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: firstImage }} style={styles.image} />
      
      {listing.isFeatured && (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>Featured</Text>
        </View>
      )}

      {onFavoritePress && (
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            onFavoritePress(listing);
          }}
        >
          <Ionicons 
            name={listing.isFavorite ? 'heart' : 'heart-outline'} 
            size={24} 
            color={listing.isFavorite ? '#FF6B6B' : '#fff'} 
          />
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        <Text style={styles.price}>{formatPrice(listing.price)}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>
        <View style={styles.footer}>
          <View style={styles.location}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.locationText} numberOfLines={1}>
              {listing.city}
            </Text>
          </View>
          <Text style={styles.time}>{timeAgo(listing.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#f0f0f0'
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  featuredText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold'
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    padding: 12
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4
  },
  title: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    height: 36
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4
  },
  time: {
    fontSize: 11,
    color: '#999'
  }
});