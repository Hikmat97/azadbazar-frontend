import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import ListingCard from './ListingCard';

export default function ListingGrid({ 
  listings, 
  onListingPress, 
  onFavoritePress,
  loading,
  refreshing,
  onRefresh,
  onEndReached
}) {
  if (loading && !refreshing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading listings...</Text>
      </View>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No listings found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={listings}
      renderItem={({ item }) => (
        <ListingCard 
          listing={item} 
          onPress={onListingPress}
          onFavoritePress={onFavoritePress}
        />
      )}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  row: {
    justifyContent: 'space-between'
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyText: {
    color: '#666',
    fontSize: 16
  }
});