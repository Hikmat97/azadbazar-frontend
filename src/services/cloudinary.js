import CONFIG from '../config/config';

export const uploadImageToCloudinary = async (imageUri) => {
  try {
    console.log('📤 Uploading image to Cloudinary...');
    
    // Create form data
    const formData = new FormData();
    
    // Get file extension
    const fileExtension = imageUri.split('.').pop();
    const fileName = `image_${Date.now()}.${fileExtension}`;
    
    // Append image
    formData.append('file', {
      uri: imageUri,
      type: `image/${fileExtension}`,
      name: fileName
    });
    
    formData.append('upload_preset', CONFIG.CLOUDINARY.uploadPreset);
    formData.append('cloud_name', CONFIG.CLOUDINARY.cloudName);
    
    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CONFIG.CLOUDINARY.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        }
      }
    );

    const data = await response.json();
    
    if (data.secure_url) {
      console.log('✅ Image uploaded successfully');
      return data.secure_url;
    } else {
      throw new Error('Upload failed');
    }
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw error;
  }
};

export const uploadMultipleImages = async (imageUris) => {
  try {
    console.log(`📤 Uploading ${imageUris.length} images...`);
    
    const uploadPromises = imageUris.map(uri => uploadImageToCloudinary(uri));
    const urls = await Promise.all(uploadPromises);
    
    console.log('✅ All images uploaded successfully');
    return urls;
  } catch (error) {
    console.error('❌ Multiple upload error:', error);
    throw error;
  }
};