import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { categoryApi } from '../../../src/api/categories';
import { listingApi } from '../../../src/api/listings';
import CategorySelector from '../../../src/components/form/CategorySelector';
import ImagePickerComponent from '../../../src/components/form/ImagePicker';
import PriceInput from '../../../src/components/form/PriceInput';
import { useImagePicker } from '../../../src/hooks/useImagePicker';
import { uploadMultipleImages } from '../../../src/services/cloudinary';

export default function EditListingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { images, pickImages, takePhoto, removeImage, setImages } = useImagePicker(5);
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'good',
    category: null,
    location: '',
    city: ''
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      
      // Load categories
      const categoriesData = await categoryApi.getAll();
      setCategories(categoriesData.categories);

      // Load listing
      const listingData = await listingApi.getById(id);
      const listing = listingData.listing;

      // Set form data
      setFormData({
        title: listing.title,
        description: listing.description,
        price: listing.price.toString(),
        condition: listing.condition,
        category: listing.category,
        location: listing.location,
        city: listing.city
      });

      // Set images
      if (listing.images && listing.images.length > 0) {
        setImages(listing.images);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load listing');
      router.back();
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert('Error', 'Please enter your city');
      return false;
    }
    if (images.length === 0) {
      Alert.alert('Error', 'Please add at least one photo');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Check if there are new images to upload
      const newImages = images.filter(img => !img.startsWith('http'));
      let allImageUrls = images.filter(img => img.startsWith('http'));

      if (newImages.length > 0) {
        Alert.alert('Uploading', 'Uploading new images...');
        const uploadedUrls = await uploadMultipleImages(newImages);
        allImageUrls = [...allImageUrls, ...uploadedUrls];
      }

      // Update listing
      const listingData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        condition: formData.condition,
        categoryId: formData.category.id,
        location: formData.location || formData.city,
        city: formData.city,
        images: allImageUrls
      };

      await listingApi.update(id, listingData);

      Alert.alert(
        'Success!',
        'Your ad has been updated successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Update listing error:', error);
      Alert.alert('Error', error.error || 'Failed to update listing');
    } finally {
      setLoading(false);
    }
  };

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  if (loadingData) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Ad</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          {/* Images */}
          <ImagePickerComponent
            images={images}
            onPickImages={pickImages}
            onTakePhoto={takePhoto}
            onRemoveImage={removeImage}
            maxImages={5}
          />

          {/* Category */}
          <CategorySelector
            categories={categories}
            selectedCategory={formData.category}
            onSelectCategory={(category) => handleChange('category', category)}
          />

          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ad Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => handleChange('title', text)}
              placeholder="e.g., iPhone 13 Pro Max"
              maxLength={70}
            />
            <Text style={styles.charCount}>{formData.title.length}/70</Text>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => handleChange('description', text)}
              placeholder="Describe your item in detail..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{formData.description.length}/500</Text>
          </View>

          {/* Price */}
          <PriceInput
            value={formData.price}
            onChangeText={(text) => handleChange('price', text)}
          />

          {/* Condition */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Condition *</Text>
            <View style={styles.conditionGrid}>
              {conditions.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.conditionButton,
                    formData.condition === item.value && styles.conditionButtonActive
                  ]}
                  onPress={() => handleChange('condition', item.value)}
                >
                  <Text
                    style={[
                      styles.conditionText,
                      formData.condition === item.value && styles.conditionTextActive
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) => handleChange('city', text)}
              placeholder="e.g., Karachi, Lahore, Islamabad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Specific Location (Optional)</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => handleChange('location', text)}
              placeholder="e.g., Gulberg, DHA, etc."
            />
          </View>

          {/* Update Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.submitButtonText}>Update Ad</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    color: '#666'
  },
  header: {
    backgroundColor: '#FF6B6B',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  placeholder: {
    width: 40
  },
  scrollContent: {
    paddingBottom: 40
  },
  form: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  textArea: {
    height: 120,
    paddingTop: 16
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4
  },
  conditionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8
  },
  conditionButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ddd'
  },
  conditionButtonActive: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FF6B6B'
  },
  conditionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  conditionTextActive: {
    color: '#FF6B6B',
    fontWeight: '600'
  },
  submitButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 20
  },
  submitButtonDisabled: {
    opacity: 0.6
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8
  }
});