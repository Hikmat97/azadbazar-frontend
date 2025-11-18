import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';
import CONFIG from '../config/config';

class SocketService {
  socket = null;
  listeners = new Map();

  async connect() {
    try {
      // Get auth token
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        console.error('❌ No token found for socket connection');
        return;
      }

      // Connect to socket server
      this.socket = io(CONFIG.SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message);
      });

      this.socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
      });

    } catch (error) {
      console.error('❌ Socket connect error:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Join conversation room
  joinConversation(conversationId) {
    if (this.socket) {
      console.log('📥 Joining conversation:', conversationId);
       this.socket.emit('join-conversation', conversationId);
   // this.socket.emit('join-conversation', { conversationId });

    }
  }

  // Leave conversation room
  leaveConversation(conversationId) {
    if (this.socket) {
      console.log('📤 Leaving conversation:', conversationId);
      this.socket.emit('leave-conversation', conversationId);
    }
  }

  // Send message
  sendMessage(conversationId, receiverId, message) {
    if (this.socket) {
      console.log('📨 Sending message:', { conversationId, receiverId });
      this.socket.emit('send-message', {
        conversationId,
        receiverId,
        message
      });
    }
  }

  // Typing indicators
  startTyping(conversationId, receiverId) {
    if (this.socket) {
      this.socket.emit('typing', { conversationId, receiverId });
    }
  }

  stopTyping(conversationId, receiverId) {
    if (this.socket) {
      this.socket.emit('stop-typing', { conversationId, receiverId });
    }
  }

  // Listen to events
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Store listener for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  // Remove listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.indexOf(callback);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
    }
  }

  // Remove all listeners for an event
  removeAllListeners(event) {
    if (this.socket) {
      this.socket.removeAllListeners(event);
      this.listeners.delete(event);
    }
  }
}

// Export singleton instance
export default new SocketService();