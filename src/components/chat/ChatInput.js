import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChatInput({ onSend, onTyping, onStopTyping }) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);

  let typingTimeout = null;

  const handleChangeText = (text) => {
    setMessage(text);

    // Typing indicator
    if (text.length > 0) {
      if (!isTyping) {
        setIsTyping(true);
        onTyping?.();
      }

      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeout = setTimeout(() => {
        setIsTyping(false);
        onStopTyping?.();
      }, 2000);
    } else {
      setIsTyping(false);
      onStopTyping?.();
    }
  };

  const handleSend = () => {
    if (message.trim().length === 0) return;

    onSend(message.trim());
    setMessage('');
    setIsTyping(false);
    onStopTyping?.();
    
    // Blur and refocus to ensure keyboard stays up
    inputRef.current?.blur();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={message}
          onChangeText={handleChangeText}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
          maxLength={1000}
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!message.trim()}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={message.trim() ? '#FF6B6B' : '#ccc'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    paddingVertical: 8,
    paddingTop: Platform.OS === 'ios' ? 8 : 6
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginBottom: 2
  },
  sendButtonDisabled: {
    opacity: 0.5
  }
});