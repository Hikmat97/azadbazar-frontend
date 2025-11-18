import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Keyboard,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { chatApi } from '../../src/api/chat';
import ChatBubble from '../../src/components/chat/ChatBubble';
import ChatInput from '../../src/components/chat/ChatInput';
import socketService from '../../src/services/socket';
import {
    addMessage,
    clearChat,
    clearUserTyping,
    setMessages,
    setUserTyping,
    updateConversation
} from '../../src/store/slices/chatSlice';

export default function ChatRoom() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { messages, conversations, typingUsers } = useSelector(state => state.chat);
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef(null);

  // Get conversation info
  const conversationFromRedux = conversations.find(c => c.id === id);
  const currentConversation = conversation || conversationFromRedux;
  const otherUser = currentConversation?.otherUser;
  const listing = currentConversation?.listing;
  const isTyping = typingUsers[id];

  useEffect(() => {
    loadConversation();
    setupSocketListeners();
    setupKeyboardListeners();

    return () => {
      cleanup();
      cleanupKeyboardListeners();
    };
  }, [id]);

  const setupKeyboardListeners = () => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        scrollToBottom();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  };

  const cleanupKeyboardListeners = () => {
    Keyboard.removeAllListeners('keyboardWillShow');
    Keyboard.removeAllListeners('keyboardDidShow');
    Keyboard.removeAllListeners('keyboardWillHide');
    Keyboard.removeAllListeners('keyboardDidHide');
  };

  const loadConversation = async () => {
    try {
      setLoading(true);
      
      if (!conversationFromRedux) {
        console.log('⚠️ Conversation not in Redux, fetching from backend...');
        
        const conversationsResponse = await chatApi.getConversations();
        const foundConversation = conversationsResponse.conversations.find(c => c.id === id);
        
        if (foundConversation) {
          console.log('✅ Found conversation:', foundConversation);
          setConversation(foundConversation);
          dispatch(updateConversation(foundConversation));
        } else {
          console.error('❌ Conversation not found');
          Alert.alert('Error', 'Conversation not found');
          router.back();
          return;
        }
      }

      const response = await chatApi.getMessages(id);
      dispatch(setMessages(response.messages));
      socketService.joinConversation(id);
      
      console.log('✅ Chat room ready');
    } catch (error) {
      console.error('❌ Error loading chat:', error);
      Alert.alert('Error', 'Failed to load chat');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    socketService.on('new-message', (message) => {
      console.log('📨 New message received:', message);
      if (message.conversationId === id) {
        dispatch(addMessage(message));
        scrollToBottom();
      }
    });

    socketService.on('user-typing', (data) => {
      if (data.conversationId === id) {
        dispatch(setUserTyping(data));
      }
    });

    socketService.on('user-stop-typing', (data) => {
      if (data.conversationId === id) {
        dispatch(clearUserTyping(data));
      }
    });

    socketService.on('message-sent', (data) => {
      console.log('✅ Message sent successfully');
    });

    socketService.on('message-error', (data) => {
      console.error('❌ Message send error:', data.error);
      Alert.alert('Error', 'Failed to send message');
    });
  };

  const cleanup = () => {
    socketService.leaveConversation(id);
    socketService.removeAllListeners('new-message');
    socketService.removeAllListeners('user-typing');
    socketService.removeAllListeners('user-stop-typing');
    socketService.removeAllListeners('message-sent');
    socketService.removeAllListeners('message-error');
    dispatch(clearChat());
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = (messageText) => {
    if (!otherUser) {
      console.error('❌ Other user not found');
      Alert.alert('Error', 'Cannot send message. Please try again.');
      return;
    }

    console.log('📤 Sending message to:', otherUser.fullName);
    socketService.sendMessage(id, otherUser.id, messageText);
    scrollToBottom();
  };

  const handleTyping = () => {
    if (otherUser) {
      socketService.startTyping(id, otherUser.id);
    }
  };

  const handleStopTyping = () => {
    if (otherUser) {
      socketService.stopTyping(id, otherUser.id);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          {otherUser?.avatar ? (
            <Image source={{ uri: otherUser.avatar }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>
              {otherUser?.fullName || 'User'}
            </Text>
            {isTyping ? (
              <Text style={styles.typingText}>typing...</Text>
            ) : (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {listing?.title || ''}
              </Text>
            )}
          </View>
        </View>

        {listing && (
          <TouchableOpacity 
            style={styles.infoButton}
            onPress={() => router.push(`/listing/${listing.id}`)}
          >
            <Ionicons name="information-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Listing Info Banner */}
      {listing && (
        <TouchableOpacity 
          style={styles.listingBanner}
          onPress={() => router.push(`/listing/${listing.id}`)}
        >
          <Image 
            source={{ uri: listing.images?.[0] || 'https://via.placeholder.com/50' }} 
            style={styles.listingImage} 
          />
          <View style={styles.listingInfo}>
            <Text style={styles.listingTitle} numberOfLines={1}>
              {listing.title}
            </Text>
            <Text style={styles.listingPrice}>
              Rs {parseFloat(listing.price).toLocaleString()}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      )}

      {/* Messages */}
      {messages.length === 0 ? (
        <View style={styles.emptyMessages}>
          <Ionicons name="chatbubbles-outline" size={60} color="#ddd" />
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>Start the conversation!</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }) => (
            <ChatBubble 
              message={item} 
              isOwn={item.senderId === user?.id}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messagesList,
            { paddingBottom: keyboardHeight > 0 ? 20 : 80 }
          ]}
          onContentSizeChange={() => scrollToBottom()}
          onLayout={() => scrollToBottom()}
        />
      )}

      {/* Chat Input - Fixed position */}
      <View style={[styles.inputWrapper, { bottom: keyboardHeight }]}>
        <ChatInput 
          onSend={handleSend}
          onTyping={handleTyping}
          onStopTyping={handleStopTyping}
        />
      </View>
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
    fontSize: 14,
    color: '#666'
  },
  header: {
    backgroundColor: '#FF6B6B',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12
  },
  headerAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  headerInfo: {
    flex: 1
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)'
  },
  typingText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontStyle: 'italic'
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  },
  listingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  listingImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12
  },
  listingInfo: {
    flex: 1
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B'
  },
  messagesList: {
    paddingTop: 12,
    flexGrow: 1
  },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4
  },
  inputWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#fff'
  }
});