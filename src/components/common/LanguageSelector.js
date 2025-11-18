import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { setLanguage } from '../src/locales/i18n';

export default function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'da', name: 'Dari', nativeName: 'دری' },
    { code: 'ps', name: 'Pashto', nativeName: 'پښتو' }
  ];

  const handleSelectLanguage = async (code) => {
    await setLanguage(code);
    setModalVisible(false);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <View>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="language" size={20} color="#666" />
        <Text style={styles.buttonText}>{currentLanguage.nativeName}</Text>
        <Ionicons name="chevron-down" size={16} color="#999" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('profile.selectLanguage')}</Text>
            
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={styles.languageItem}
                onPress={() => handleSelectLanguage(lang.code)}
              >
                <Text style={styles.languageName}>{lang.nativeName}</Text>
                {i18n.language === lang.code && (
                  <Ionicons name="checkmark" size={24} color="#FF6B6B" />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8
  },
  buttonText: {
    marginLeft: 8,
    marginRight: 4,
    fontSize: 16,
    color: '#333',
    flex: 1
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
    padding: 20,
    paddingBottom: 40
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  languageName: {
    fontSize: 18,
    color: '#333'
  },
  closeButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center'
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666'
  }
});