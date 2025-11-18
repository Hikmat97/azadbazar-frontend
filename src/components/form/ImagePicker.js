import { Ionicons } from '@expo/vector-icons';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ImagePickerComponent({ 
  images, 
  onPickImages, 
  onTakePhoto, 
  onRemoveImage,
  maxImages = 5 
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Photos ({images.length}/{maxImages})</Text>
      <Text style={styles.hint}>Add up to {maxImages} photos</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {/* Add Photo Buttons */}
        {images.length < maxImages && (
          <View style={styles.addButtons}>
            <TouchableOpacity style={styles.addButton} onPress={onPickImages}>
              <Ionicons name="images" size={32} color="#FF6B6B" />
              <Text style={styles.addButtonText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.addButton} onPress={onTakePhoto}>
              <Ionicons name="camera" size={32} color="#FF6B6B" />
              <Text style={styles.addButtonText}>Camera</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Image Previews */}
        {images.map((uri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemoveImage(index)}
            >
              <Ionicons name="close-circle" size={24} color="#FF6B6B" />
            </TouchableOpacity>
            {index === 0 && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryText}>Cover</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  hint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12
  },
  addButtons: {
    flexDirection: 'row',
    marginRight: 12
  },
  addButton: {
    width: 100,
    height: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  addButtonText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  imageContainer: {
    width: 100,
    height: 100,
    marginRight: 12,
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  primaryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold'
  }
});