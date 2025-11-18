import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { chatApi } from '../../src/api/chat';
import ConversationCard from '../../src/components/chat/ConversationCard';
import notificationService from '../../src/services/notification';
import socketService from '../../src/services/socket';
import { addOnlineUser, removeOnlineUser, setConversations } from '../../src/store/slices/chatSlice';

export default function ChatsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { conversations, onlineUsers } = useSelector(state => state.chat);
  const { user } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadConversations();
    setupSocketListeners();

    return () => {
      cleanupSocketListeners();
    };
  }, []);

  // Clear notifications when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadConversations();
      // Clear all chat notifications when viewing chat list
      notificationService.clearAllNotifications();
    }, [])
  );

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await chatApi.getConversations();
      dispatch(setConversations(response.conversations));
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const setupSocketListeners = () => {
    socketService.on('new-message', (message) => {
      console.log('📨 New message received:', message);
      loadConversations();
    });

    socketService.on('user-online', (data) => {
      dispatch(addOnlineUser(data.userId));
    });

    socketService.on('user-offline', (data) => {
      dispatch(removeOnlineUser(data.userId));
    });

    socketService.on('message-notification', (data) => {
      console.log('🔔 Message notification:', data);
      loadConversations();
    });
  };

  const cleanupSocketListeners = () => {
    socketService.removeAllListeners('new-message');
    socketService.removeAllListeners('user-online');
    socketService.removeAllListeners('user-offline');
    socketService.removeAllListeners('message-notification');
  };

  const handleConversationPress = (conversation) => {
    router.push(`/chat/${conversation.id}`);
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading chats...</Text>
      </View>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Chats</Text>
        </View>
        <View style={styles.empty}>
          <Ionicons name="chatbubbles-outline" size={80} color="#ddd" />
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>
            Start chatting with sellers by clicking "Chat" on any listing
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
      </View>

      <FlatList
        data={conversations}
        renderItem={({ item }) => (
          <ConversationCard
            conversation={item}
            onPress={() => handleConversationPress(item)}
            isOnline={isUserOnline(item.otherUser?.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
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
    backgroundColor: '#fff'
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14
  },
  header: {
    backgroundColor: '#FF6B6B',
    padding: 20,
    paddingTop: 60
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center'
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center'
  }
});