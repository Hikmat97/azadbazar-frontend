import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ConversationCard({ conversation, onPress, isOnline }) {
  const { otherUser, listing, lastMessage, lastMessageAt, unreadCount } = conversation;

  const formatTime = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const messageDate = new Date(date);
    const diffInSeconds = Math.floor((now - messageDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    
    const days = Math.floor(diffInSeconds / 86400);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    
    return messageDate.toLocaleDateString();
  };

  const listingImage = listing?.images?.[0] || 'https://via.placeholder.com/60';

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* User Avatar */}
      <View style={styles.avatarContainer}>
        {otherUser?.avatar ? (
          <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={24} color="#999" />
          </View>
        )}
        {isOnline && <View style={styles.onlineDot} />}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {otherUser?.fullName}
          </Text>
          <Text style={styles.time}>{formatTime(lastMessageAt)}</Text>
        </View>

        <Text style={styles.listingTitle} numberOfLines={1}>
          📦 {listing?.title}
        </Text>

        <View style={styles.footer}>
          <Text 
            style={[styles.lastMessage, unreadCount > 0 && styles.unreadMessage]} 
            numberOfLines={1}
          >
            {lastMessage || 'Start a conversation'}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Listing Image */}
      <Image source={{ uri: listingImage }} style={styles.listingImage} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff'
  },
  content: {
    flex: 1,
    justifyContent: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8
  },
  time: {
    fontSize: 12,
    color: '#999'
  },
  listingTitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  lastMessage: {
    fontSize: 14,
    color: '#999',
    flex: 1,
    marginRight: 8
  },
  unreadMessage: {
    color: '#333',
    fontWeight: '500'
  },
  badge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  listingImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginLeft: 8
  }
});