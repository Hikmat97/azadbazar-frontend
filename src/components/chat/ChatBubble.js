import { StyleSheet, Text, View } from 'react-native';

export default function ChatBubble({ message, isOwn }) {
  const formatTime = (date) => {
    const messageDate = new Date(date);
    const hours = messageDate.getHours();
    const minutes = messageDate.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, isOwn && styles.ownContainer]}>
      <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        <Text style={[styles.message, isOwn && styles.ownMessage]}>
          {message.message}
        </Text>
        <Text style={[styles.time, isOwn && styles.ownTime]}>
          {formatTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12
  },
  ownContainer: {
    justifyContent: 'flex-end'
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18
  },
  otherBubble: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4
  },
  ownBubble: {
    backgroundColor: '#FF6B6B',
    borderBottomRightRadius: 4
  },
  message: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20
  },
  ownMessage: {
    color: '#fff'
  },
  time: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end'
  },
  ownTime: {
    color: 'rgba(255,255,255,0.8)'
  }
});