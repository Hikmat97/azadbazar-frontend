import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';

export const useImagePicker = (maxImages = 5) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to upload images!'
      );
      return false;
    }
    return true;
  };

  const pickImages = async () => {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      if (images.length >= maxImages) {
        Alert.alert('Limit Reached', `You can only upload ${maxImages} images`);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        aspect: [4, 3],
        quality: 0.8,
        selectionLimit: maxImages - images.length
      });

      if (!result.canceled) {
        const newImages = result.assets.map(asset => asset.uri);
        setImages(prev => [...prev, ...newImages].slice(0, maxImages));
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera permissions to take photos!'
        );
        return;
      }

      if (images.length >= maxImages) {
        Alert.alert('Limit Reached', `You can only upload ${maxImages} images`);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8
      });

      if (!result.canceled) {
        setImages(prev => [...prev, result.assets[0].uri].slice(0, maxImages));
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearImages = () => {
    setImages([]);
  };

  return {
    images,
    loading,
    pickImages,
    takePhoto,
    removeImage,
    clearImages,
    setImages
  };
};