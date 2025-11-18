import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { listingApi } from '../../src/api/listings';
import ListingGrid from '../../src/components/listing/ListingGrid';
import SearchBar from '../../src/components/search/SearchBar';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setHasSearched(true);
      const response = await listingApi.getAll({ search: searchQuery });
      setListings(response.listings);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleListingPress = (listing) => {
    router.push(`/listing/${listing.id}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        
        <View style={styles.searchContainer}>
          <SearchBar 
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for anything..."
            editable={true}
          />
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Results */}
      {!hasSearched ? (
        <View style={styles.empty}>
          <Ionicons name="search" size={80} color="#ddd" />
          <Text style={styles.emptyText}>Search for anything you need</Text>
          <Text style={styles.emptySubtext}>
            Enter keywords in the search box above
          </Text>
        </View>
      ) : (
        <ListingGrid 
          listings={listings}
          onListingPress={handleListingPress}
          loading={loading}
        />
      )}
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
    paddingHorizontal: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  searchButton: {
    width: 45,
    height: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center'
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center'
  }
});