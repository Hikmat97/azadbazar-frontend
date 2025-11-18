import { FlatList, StyleSheet, Text, View } from 'react-native';
import CategoryCard from './CategoryCard';

export default function CategoryGrid({ categories, onCategoryPress, loading }) {
  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>Loading categories...</Text>
      </View>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <View style={styles.empty}>
        <Text>No categories available</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={categories}
      renderItem={({ item }) => (
        <CategoryCard category={item} onPress={onCategoryPress} />
      )}
      keyExtractor={(item) => item.id}
      numColumns={4}
      columnWrapperStyle={styles.row}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 4
  },
  loading: {
    padding: 20,
    alignItems: 'center'
  },
  empty: {
    padding: 20,
    alignItems: 'center'
  }
});