import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { categoryApi } from '../../src/api/categories';
import { listingApi } from '../../src/api/listings';
import CategoryGrid from '../../src/components/category/CategoryGrid';
import ListingGrid from '../../src/components/listing/ListingGrid';
import SearchBar from '../../src/components/search/SearchBar';
import { setCategories, setLoading as setCategoryLoading } from '../../src/store/slices/categorySlice';
import { setFeaturedListings, setLoading as setListingLoading } from '../../src/store/slices/listingSlice';
export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user } = useSelector(state => state.auth);
  const { categories, loading: categoryLoading } = useSelector(state => state.category);
  const { featuredListings, loading: listingLoading } = useSelector(state => state.listing);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load categories
      dispatch(setCategoryLoading(true));
      const categoriesData = await categoryApi.getAll();
      dispatch(setCategories(categoriesData.categories));

      // Load featured listings
      dispatch(setListingLoading(true));
      const listingsData = await listingApi.getAll({ featured: true, limit: 10 });
      dispatch(setFeaturedListings(listingsData.listings));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCategoryPress = (category) => {
    router.push(`/category/${category.id}`);
  };

  const handleListingPress = (listing) => {
    router.push(`/listing/${listing.id}`);
  };

  const handleSearchPress = () => {
    router.push('/search');
  };

  return (
   // ... (inside the return statement)

<ScrollView 
  style={styles.container}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
>
  {/* Header */}
  <View style={styles.header}>
    {/* Title: "Welcome to OLX Clone!" -> t('home.welcome') */}
    <Text style={styles.title}>{t('home.welcome')}</Text> 
    
    {user && (
      <Text style={styles.subtitle}>
        {/* Subtitle: "Hello, {user.fullName}!" -> t('home.hello') */}
        {t('home.hello')}, {user.fullName}!
      </Text>
    )}
    
    {/* Search Bar */}
    <SearchBar 
      onPress={handleSearchPress}
      // Placeholder: "Search for anything..." -> t('home.findAnything')
      placeholder={t('home.findAnything')}
      editable={false}
    />
  </View>

  {/* Categories */}
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      {/* Section Title: "Browse Categories" -> t('home.browseCategories') */}
      <Text style={styles.sectionTitle}>{t('home.browseCategories')}</Text>
    </View>
    <CategoryGrid 
      categories={categories}
      onCategoryPress={handleCategoryPress}
      loading={categoryLoading}
    />
  </View>

  {/* Featured Listings */}
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      {/* Section Title: "Featured Ads" -> t('home.featuredAds') */}
      <Text style={styles.sectionTitle}>{t('home.featuredAds')}</Text>
      <TouchableOpacity onPress={() => router.push('/search')}>
        {/* Link: "See All" -> t('common.seeAll') */}
        <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
      </TouchableOpacity>
    </View>
    <ListingGrid 
      listings={featuredListings}
      onListingPress={handleListingPress}
      loading={listingLoading}
    />
  </View>
</ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#FF6B6B',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 24
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingVertical: 20
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  seeAll: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600'
  }
});