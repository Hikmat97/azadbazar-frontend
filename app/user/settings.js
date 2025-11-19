// app/user/settings.js
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { setLanguage } from '../../src/locales/i18n';

export default function SettingsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const languages = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇬🇧'
    },
    {
      code: 'da',
      name: 'Dari',
      nativeName: 'دری',
      flag: '🇦🇫'
    },
    {
      code: 'ps',
      name: 'Pashto',
      nativeName: 'پښتو',
      flag: '🇦🇫'
    }
  ];

  const handleSelectLanguage = async (code) => {
    await setLanguage(code);
    setModalVisible(false);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.settings')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Settings Content */}
      <ScrollView style={styles.content}>
        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setModalVisible(true)}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="language" size={24} color="#FF6B6B" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                {t('profile.selectLanguage')}
              </Text>
              <Text style={styles.settingValue}>
                {currentLanguage.flag} {currentLanguage.nativeName}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.about')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="information-circle" size={24} color="#FF6B6B" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{t('profile.version')}</Text>
              <Text style={styles.settingValue}>1.0.0</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t('profile.selectLanguage')}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={styles.languageItem}
                  onPress={() => handleSelectLanguage(lang.code)}
                >
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageNative}>{lang.nativeName}</Text>
                    <Text style={styles.languageEnglish}>{lang.name}</Text>
                  </View>
                  {i18n.language === lang.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#FF6B6B" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  placeholder: {
    width: 40
  },
  content: {
    flex: 1
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingVertical: 8
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    paddingHorizontal: 20,
    paddingVertical: 12,
    textTransform: 'uppercase'
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  settingContent: {
    flex: 1
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2
  },
  settingValue: {
    fontSize: 13,
    color: '#999'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  languageFlag: {
    fontSize: 32,
    marginRight: 16
  },
  languageInfo: {
    flex: 1
  },
  languageNative: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2
  },
  languageEnglish: {
    fontSize: 14,
    color: '#666'
  }
});