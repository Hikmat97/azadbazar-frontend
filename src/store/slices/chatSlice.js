import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  error: null,
  typingUsers: {}, // { conversationId: userId }
  onlineUsers: []
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
      state.loading = false;
    },
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
      state.loading = false;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      
      // Update last message in conversation
      const conversation = state.conversations.find(
        c => c.id === action.payload.conversationId
      );
      if (conversation) {
        conversation.lastMessage = action.payload.message;
        conversation.lastMessageAt = action.payload.createdAt;
      }
    },
    updateConversation: (state, action) => {
      const index = state.conversations.findIndex(
        c => c.id === action.payload.id
      );
      if (index !== -1) {
        state.conversations[index] = action.payload;
      } else {
        state.conversations.unshift(action.payload);
      }
      
      // Sort by last message time
      state.conversations.sort((a, b) => 
        new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
      );
    },
    setUserTyping: (state, action) => {
      const { conversationId, userId } = action.payload;
      state.typingUsers[conversationId] = userId;
    },
    clearUserTyping: (state, action) => {
      const { conversationId } = action.payload;
      delete state.typingUsers[conversationId];
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    addOnlineUser: (state, action) => {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },
    removeOnlineUser: (state, action) => {
      state.onlineUsers = state.onlineUsers.filter(
        id => id !== action.payload
      );
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearChat: (state) => {
      state.currentConversation = null;
      state.messages = [];
    }
  }
});

export const {
  setConversations,
  setCurrentConversation,
  setMessages,
  addMessage,
  updateConversation,
  setUserTyping,
  clearUserTyping,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  setLoading,
  setError,
  clearError,
  clearChat
} = chatSlice.actions;

export default chatSlice.reducer;