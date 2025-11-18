import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CategoryCard({ category, onPress }) {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(category)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={category.icon} size={32} color="#FF6B6B" />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center'
  }
});