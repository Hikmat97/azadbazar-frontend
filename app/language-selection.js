// app/language-selection.js
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { setLanguage } from '../src/locales/i18n';

const LANGUAGE_SELECTED_KEY = '@language_selected';

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const languages = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇬🇧',
      description: 'International language'
    },
    {
      code: 'da',
      name: 'Dari',
      nativeName: 'دری',
      flag: '🇦🇫',
      description: 'زبان رسمی افغانستان'
    },
    {
      code: 'ps',
      name: 'Pashto',
      nativeName: 'پښتو',
      flag: '🇦🇫',
      description: 'د افغانستان رسمي ژبه'
    }
  ];

  const handleLanguageSelect = (langCode) => {
    setSelectedLanguage(langCode);
  };

  const handleContinue = async () => {
    if (!selectedLanguage) {
      return;
    }

    try {
      // Set the selected language
      await setLanguage(selectedLanguage);
      
      // Mark that language has been selected
      await AsyncStorage.setItem(LANGUAGE_SELECTED_KEY, 'true');
      
      // Navigate to auth screen
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo/Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="globe-outline" size={80} color="#FF6B6B" />
          </View>
          <Text style={styles.title}>Choose Your Language</Text>
          <Text style={styles.titleDari}>زبان خود را انتخاب کنید</Text>
          <Text style={styles.titlePashto}>خپله ژبه انتخاب کړئ</Text>
          <Text style={styles.subtitle}>
            Select your preferred language to continue
          </Text>
        </View>

        {/* Language Options */}
        <View style={styles.languageContainer}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageCard,
                selectedLanguage === lang.code && styles.languageCardSelected
              ]}
              onPress={() => handleLanguageSelect(lang.code)}
              activeOpacity={0.7}
            >
              <View style={styles.languageContent}>
                <Text style={styles.flag}>{lang.flag}</Text>
                <View style={styles.languageInfo}>
                  <Text style={styles.languageName}>{lang.nativeName}</Text>
                  <Text style={styles.languageEnglishName}>{lang.name}</Text>
                  <Text style={styles.languageDescription}>
                    {lang.description}
                  </Text>
                </View>
              </View>
              
              {selectedLanguage === lang.code && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={28} color="#FF6B6B" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedLanguage && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!selectedLanguage}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Skip Option */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={async () => {
            // Set default language (English)
            await setLanguage('en');
            await AsyncStorage.setItem(LANGUAGE_SELECTED_KEY, 'true');
            router.replace('/(auth)/login');
          }}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40
  },
  logoContainer: {
    marginBottom: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8
  },
  titleDari: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 4
  },
  titlePashto: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 12
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center'
  },
  languageContainer: {
    marginBottom: 30
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  languageCardSelected: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FF6B6B'
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  flag: {
    fontSize: 48,
    marginRight: 16
  },
  languageInfo: {
    flex: 1
  },
  languageName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  languageEnglishName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2
  },
  languageDescription: {
    fontSize: 12,
    color: '#999'
  },
  checkmark: {
    marginLeft: 12
  },
  continueButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc'
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8
  },
  skipButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 12
  },
  skipButtonText: {
    color: '#999',
    fontSize: 14
  }
});