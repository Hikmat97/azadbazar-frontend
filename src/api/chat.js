import apiClient from './client';

export const chatApi = {
  getOrCreateConversation: (userId, listingId) => {
    console.log('📝 Getting/creating conversation');
    return apiClient.post('/chat/conversations', { userId, listingId });
  },
  
  getConversations: () => {
    console.log('📝 Fetching conversations');
    return apiClient.get('/chat/conversations');
  },
  
  getMessages: (conversationId, page = 1) => {
    console.log('📝 Fetching messages for:', conversationId);
    return apiClient.get(`/chat/conversations/${conversationId}/messages`, {
      params: { page }
    });
  }
};