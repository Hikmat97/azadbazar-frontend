import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';

export default function SearchBar({ 
  value, 
  onChangeText, 
  onPress, 
  placeholder = 'Search...',
  editable = true 
}) {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={editable ? 1 : 0.7}
      disabled={editable}
    >
      <Ionicons name="search" size={20} color="#666" style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        editable={editable}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
    marginTop: 12
  },
  icon: {
    marginRight: 8
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333'
  }
});