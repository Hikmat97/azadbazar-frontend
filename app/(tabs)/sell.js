
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
  scrollContent: {
    paddingBottom: 40
  },
  header: {
    backgroundColor: '#FF6B6B',
    padding: 20,
    paddingTop: 60
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9
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




import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next'; // <-- ADDED
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
import { useSelector } from 'react-redux';
import { categoryApi } from '../../src/api/categories';
import { listingApi } from '../../src/api/listings';
import CategorySelector from '../../src/components/form/CategorySelector';
import ImagePickerComponent from '../../src/components/form/ImagePicker';
import PriceInput from '../../src/components/form/PriceInput';
import { useImagePicker } from '../../src/hooks/useImagePicker';
import { uploadMultipleImages } from '../../src/services/cloudinary';

export default function SellScreen() {
  const router = useRouter();
  const { user } = useSelector(state => state.auth);
  const { t } = useTranslation(); // <-- INITIALIZED
  const { images, pickImages, takePhoto, removeImage } = useImagePicker(5);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

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
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    // Localization for validation messages
    if (!formData.title.trim()) {
      Alert.alert(t('common.error'), t('sell.validation.titleRequired'));
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert(t('common.error'), t('sell.validation.descriptionRequired'));
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert(t('common.error'), t('sell.validation.priceInvalid'));
      return false;
    }
    if (!formData.category) {
      Alert.alert(t('common.error'), t('sell.validation.categoryRequired'));
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert(t('common.error'), t('sell.validation.cityRequired'));
      return false;
    }
    if (images.length === 0) {
      Alert.alert(t('common.error'), t('sell.validation.photoRequired'));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Upload images to Cloudinary
      Alert.alert(t('common.uploading'), t('sell.uploadingImages')); // Localization for uploading message
      const imageUrls = await uploadMultipleImages(images);
      console.log('✅ Images uploaded:', imageUrls);

      // Create listing
      const listingData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        condition: formData.condition,
        categoryId: formData.category.id,
        location: formData.location || formData.city,
        city: formData.city,
        state: 'Pakistan',
        images: imageUrls
      };

      const response = await listingApi.create(listingData);
      console.log('✅ Listing created:', response);

      // Localization for success alert
      Alert.alert(
        t('common.success'),
        t('sell.postSuccess'),
        [
          {
            text: t('sell.viewAd'),
            onPress: () => router.push(`/listing/${response.listing.id}`)
          },
          {
            text: t('sell.postAnother'),
            onPress: () => {
              setFormData({
                title: '',
                description: '',
                price: '',
                condition: 'good',
                category: null,
                location: '',
                city: ''
              });
              removeImage(0); // This will clear all images
            }
          }
        ]
      );
    } catch (error) {
      console.error('Create listing error:', error);
      // Localization for error alert
      Alert.alert(t('common.error'), error.error || t('sell.postError'));
    } finally {
      setLoading(false);
    }
  };

  // Localization for condition labels
  const conditions = [
    { value: 'new', label: t('sell.conditionNew') },
    { value: 'like-new', label: t('sell.conditionLikeNew') },
    { value: 'good', label: t('sell.conditionGood') },
    { value: 'fair', label: t('sell.conditionFair') },
    { value: 'poor', label: t('sell.conditionPoor') }
  ];

  if (loadingCategories) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          {/* Localized Title */}
          <Text style={styles.title}>{t('sell.title')}</Text>
          {/* Localized Subtitle */}
          <Text style={styles.subtitle}>{t('sell.subtitle')}</Text>
        </View>

        <View style={styles.form}>
          {/* Images are handled by ImagePickerComponent */}
          <ImagePickerComponent
            images={images}
            onPickImages={pickImages}
            onTakePhoto={takePhoto}
            onRemoveImage={removeImage}
            maxImages={5}
          />

          {/* Category is handled by CategorySelector */}
          <CategorySelector
            categories={categories}
            selectedCategory={formData.category}
            onSelectCategory={(category) => handleChange('category', category)}
          />

          {/* Title */}
          <View style={styles.inputGroup}>
            {/* Localized Label */}
            <Text style={styles.label}>{t('sell.labelTitle')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => handleChange('title', text)}
              // Localized Placeholder
              placeholder={t('sell.placeholderTitle')}
              maxLength={70}
            />
            <Text style={styles.charCount}>{formData.title.length}/70</Text>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            {/* Localized Label */}
            <Text style={styles.label}>{t('sell.labelDescription')} *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => handleChange('description', text)}
              // Localized Placeholder
              placeholder={t('sell.placeholderDescription')}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{formData.description.length}/500</Text>
          </View>

          {/* Price - PriceInput component should handle its own localization */}
          <PriceInput
            value={formData.price}
            onChangeText={(text) => handleChange('price', text)}
          />

          {/* Condition */}
          <View style={styles.inputGroup}>
            {/* Localized Label */}
            <Text style={styles.label}>{t('sell.labelCondition')} *</Text>
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
                    {/* Condition label is already localized from the 'conditions' array */}
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* City Location */}
          <View style={styles.inputGroup}>
            {/* Localized Label */}
            <Text style={styles.label}>{t('sell.labelCity')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) => handleChange('city', text)}
              // Localized Placeholder
              placeholder={t('sell.placeholderCity')}
            />
          </View>

          {/* Specific Location (Optional) */}
          <View style={styles.inputGroup}>
            {/* Localized Label */}
            <Text style={styles.label}>{t('sell.labelLocation')}</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => handleChange('location', text)}
              // Localized Placeholder
              placeholder={t('sell.placeholderLocation')}
            />
          </View>

          {/* Submit Button */}
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
                {/* Localized Button Text */}
                <Text style={styles.submitButtonText}>{t('sell.postAd')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

