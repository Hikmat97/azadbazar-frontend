import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function PriceInput({ value, onChangeText }) {
  const formatPrice = (text) => {
    // Remove non-numeric characters
    const numeric = text.replace(/[^0-9]/g, '');
    onChangeText(numeric);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Price (Rs) *</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.currency}>Rs</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={formatPrice}
          placeholder="0"
          keyboardType="numeric"
          maxLength={10}
        />
      </View>
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
    marginBottom: 8
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 16
  },
  currency: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginRight: 8
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingVertical: 16
  }
});