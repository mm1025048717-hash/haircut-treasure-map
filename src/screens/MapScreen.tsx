import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
  Image,
  Modal,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useStore, shopCategoryConfig } from '../store';
import { Shop, Coordinates, ShopCategory } from '../types';
import {
  colors,
  borderRadius,
  fontSize,
  fontWeight,
  spacing,
} from '../theme';
import AddShopModal from '../components/AddShopModal';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DEFAULT_REGION: Region = {
  latitude: 39.9087,
  longitude: 116.3975,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const MapScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const store = useStore();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [searchText, setSearchText] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showAddShopModal, setShowAddShopModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<ShopCategory[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);

  // 获取店铺列表
  const allShops = store.getShops();

  // 切换分类选择
  const toggleCategory = (category: ShopCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // 重置筛选
  const resetFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 500]);
    setShowFavoritesOnly(false);
  };

  // 筛选店铺
  const filteredShops = useMemo(() => {
    let result = allShops;

    // 搜索过滤
    if (searchText.trim()) {
      const keyword = searchText.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(keyword) ||
          s.address.toLowerCase().includes(keyword)
      );
    }

    // 只看收藏
    if (showFavoritesOnly) {
      result = result.filter((s) => s.isFavorite);
    }

    // 分类过滤
    if (selectedCategories.length > 0) {
      result = result.filter((s) => selectedCategories.includes(s.category));
    }

    // 价格区间过滤
    result = result.filter(
      (s) => s.avgPrice >= priceRange[0] && s.avgPrice <= priceRange[1]
    );

    return result;
  }, [allShops, searchText, showFavoritesOnly, selectedCategories, priceRange]);

  // 检查是否有活跃的筛选条件
  const hasActiveFilters = selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 500;

  const requestLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('定位权限未开启', '请在系统设置中允许定位权限');
      return;
    }

    const current = await Location.getCurrentPositionAsync({});
    const nextRegion: Region = {
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
    setUserLocation({
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
    });
    setRegion(nextRegion);
    mapRef.current?.animateToRegion(nextRegion, 500);
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const handleShopPress = (shop: Shop) => {
    setSelectedShop(shop);
    // 移动地图到选中的店铺
    mapRef.current?.animateToRegion(
      {
        latitude: shop.location.latitude,
        longitude: shop.location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      300
    );
  };

  const goToDetail = (shop: Shop) => {
    navigation.navigate('ShopDetail', { shopId: shop.id });
  };

  const handleToggleFavorite = (shop: Shop) => {
    store.toggleFavorite(shop.id);
    // 更新选中的店铺状态
    if (selectedShop?.id === shop.id) {
      setSelectedShop(store.getShopById(shop.id) || null);
    }
  };

  const recordCount = selectedShop
    ? store.getRecordsByShopId(selectedShop.id).length
    : 0;

  return (
    <View style={styles.container}>
      {/* 顶部标题 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>理发指南</Text>
        <View style={styles.headerRight}>
          <Pressable style={styles.locateBtnTop} onPress={requestLocation}>
            <Text style={styles.locateBtnTopText}>◎ 定位</Text>
          </Pressable>
        </View>
      </View>

      {/* 搜索栏 */}
      <View style={styles.searchBar}>
        <View style={styles.searchInputWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="搜索附近理发店..."
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
          />
          <Pressable style={styles.filterIcon} onPress={() => setShowFilterModal(true)}>
            <Text style={styles.filterIconText}>⚙</Text>
            {hasActiveFilters && <View style={styles.filterBadge} />}
          </Pressable>
        </View>
      </View>

      {/* Tab 切换 */}
      <View style={styles.tabBar}>
        <Pressable 
          style={[styles.tab, activeTab === 'map' && styles.tabActive]}
          onPress={() => setActiveTab('map')}
        >
          <Text style={[styles.tabText, activeTab === 'map' && styles.tabTextActive]}>地图</Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'list' && styles.tabActive]}
          onPress={() => setActiveTab('list')}
        >
          <Text style={[styles.tabText, activeTab === 'list' && styles.tabTextActive]}>列表</Text>
        </Pressable>
      </View>

      {/* 地图 */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={Boolean(userLocation)}
        onRegionChangeComplete={setRegion}
        onPress={() => setSelectedShop(null)}
      >
        {filteredShops.map((shop) => (
          <Marker
            key={shop.id}
            coordinate={shop.location}
            onPress={() => handleShopPress(shop)}
            tracksViewChanges={false}
          >
            <View style={styles.markerContainer}>
              <View style={[
                styles.marker,
                shop.isFavorite && styles.markerFavorite,
                selectedShop?.id === shop.id && styles.markerSelected,
              ]}>
                <Text style={styles.markerName}>{shop.name?.slice(0, 4) || '店铺'}</Text>
                <Text style={styles.markerPrice}>¥{shop.avgPrice}</Text>
              </View>
              <View style={styles.markerArrow} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* 底部店铺列表/详情 */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>
          {selectedShop ? '店铺信息' : `附近店铺 · ${filteredShops.length}家`}
        </Text>

        {selectedShop ? (
          <View style={styles.selectedCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardName}>{selectedShop.name}</Text>
              <Pressable 
                style={styles.favoriteBtn}
                onPress={() => handleToggleFavorite(selectedShop)}
              >
                <Text style={[
                  styles.favoriteBtnText,
                  selectedShop.isFavorite && styles.favoriteBtnTextActive
                ]}>
                  {selectedShop.isFavorite ? '已收藏' : '收藏'}
                </Text>
              </Pressable>
            </View>

            <Text style={styles.cardAddress}>{selectedShop.address}</Text>
            {selectedShop.phone && (
              <Text style={styles.cardPhone}>{selectedShop.phone}</Text>
            )}

            <View style={styles.cardStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>¥{selectedShop.avgPrice}</Text>
                <Text style={styles.statLabel}>均价</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  ¥{selectedShop.priceRange[0]}-{selectedShop.priceRange[1]}
                </Text>
                <Text style={styles.statLabel}>价格区间</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{recordCount}</Text>
                <Text style={styles.statLabel}>理发次数</Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              <Pressable style={styles.secondaryBtn} onPress={() => setSelectedShop(null)}>
                <Text style={styles.secondaryBtnText}>返回</Text>
              </Pressable>
              <Pressable style={styles.primaryBtn} onPress={() => goToDetail(selectedShop)}>
                <Text style={styles.primaryBtnText}>查看详情</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shopList}
          >
            {filteredShops.map((shop) => (
              <Pressable
                key={shop.id}
                style={styles.shopCard}
                onPress={() => handleShopPress(shop)}
              >
                {shop.photos && shop.photos.length > 0 && (
                  <Image
                    source={{ uri: shop.photos[0] }}
                    style={styles.shopCardImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.shopCardContent}>
                  <View style={styles.shopCardHeader}>
                    <Text style={styles.shopCardName} numberOfLines={1}>{shop.name}</Text>
                    {shop.isFavorite && <View style={styles.favoriteDot} />}
                  </View>
                  <View style={[styles.categoryBadge, { backgroundColor: (shopCategoryConfig[shop.category]?.color || colors.border) + '30' }]}>
                    <Text style={[styles.categoryBadgeText, { color: shopCategoryConfig[shop.category]?.color || colors.textMuted }]}>
                      {shopCategoryConfig[shop.category]?.label || '其他'}
                    </Text>
                  </View>
                  <Text style={styles.shopCardAddress} numberOfLines={1}>
                    {shop.address}
                  </Text>
                  <Text style={styles.shopCardPrice}>
                    ¥{shop.avgPrice}
                    <Text style={styles.shopCardRange}>
                      {' '}({shop.priceRange?.[0] || 0}-{shop.priceRange?.[1] || 0})
                    </Text>
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      {/* 添加店铺按钮 */}
      <Pressable
        style={styles.addButton}
        onPress={() => setShowAddShopModal(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </Pressable>

      {/* 添加店铺弹窗 */}
      <AddShopModal
        visible={showAddShopModal}
        onClose={() => setShowAddShopModal(false)}
      />

      {/* 筛选弹窗 */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>筛选条件</Text>
              <Pressable onPress={() => setShowFilterModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </Pressable>
            </View>

            {/* 快捷筛选 */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>快捷筛选</Text>
              <Pressable
                style={[styles.quickFilterBtn, showFavoritesOnly && styles.quickFilterBtnActive]}
                onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
              >
                <Text style={[styles.quickFilterText, showFavoritesOnly && styles.quickFilterTextActive]}>
                  ♥ 只看收藏
                </Text>
              </Pressable>
            </View>

            {/* 店铺类型 */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>店铺类型</Text>
              <View style={styles.filterOptions}>
                {Object.entries(shopCategoryConfig).map(([key, config]) => (
                  <Pressable
                    key={key}
                    style={[
                      styles.filterChip,
                      selectedCategories.includes(key as ShopCategory) && styles.filterChipActive,
                    ]}
                    onPress={() => toggleCategory(key as ShopCategory)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedCategories.includes(key as ShopCategory) && styles.filterChipTextActive,
                      ]}
                    >
                      {config.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* 价格区间 */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>价格区间</Text>
              <View style={styles.priceRangeRow}>
                {[
                  { range: [0, 30], label: '¥0-30' },
                  { range: [0, 50], label: '¥0-50' },
                  { range: [0, 100], label: '¥0-100' },
                  { range: [100, 500], label: '¥100+' },
                ].map((item) => (
                  <Pressable
                    key={item.label}
                    style={[
                      styles.priceChip,
                      priceRange[0] === item.range[0] && priceRange[1] === item.range[1] && styles.priceChipActive,
                    ]}
                    onPress={() => setPriceRange(item.range as [number, number])}
                  >
                    <Text
                      style={[
                        styles.priceChipText,
                        priceRange[0] === item.range[0] && priceRange[1] === item.range[1] && styles.priceChipTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* 底部按钮 */}
            <View style={styles.filterFooter}>
              <Pressable style={styles.resetBtn} onPress={resetFilters}>
                <Text style={styles.resetBtnText}>重置</Text>
              </Pressable>
              <Pressable style={styles.applyBtn} onPress={() => setShowFilterModal(false)}>
                <Text style={styles.applyBtnText}>确定 ({filteredShops.length})</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingTop: 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locateBtnTop: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  locateBtnTopText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
  },
  searchBar: {
    position: 'absolute',
    top: 95,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 10,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#FFFFFF',
    fontSize: fontSize.md,
  },
  filterIcon: {
    padding: spacing.sm,
  },
  filterIconText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.5)',
  },
  tabBar: {
    position: 'absolute',
    top: 150,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    zIndex: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.accent,
  },
  tabText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  tabTextActive: {
    color: colors.accent,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    backgroundColor: 'rgba(30,30,53,0.95)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    minWidth: 70,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  markerFavorite: {
    backgroundColor: colors.accent,
  },
  markerSelected: {
    backgroundColor: colors.accent,
    transform: [{ scale: 1.05 }],
  },
  markerName: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  markerPrice: {
    fontSize: fontSize.xs,
    color: colors.accent,
    fontWeight: fontWeight.medium,
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(30,30,53,0.95)',
    marginTop: -1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 85,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    maxHeight: '35%',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.lg,
  },
  shopList: {
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  shopCard: {
    width: 165,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  shopCardImage: {
    width: '100%',
    height: 90,
  },
  shopCardContent: {
    padding: spacing.md,
  },
  shopCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  shopCardName: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    flex: 1,
  },
  favoriteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginLeft: spacing.xs,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  categoryBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  shopCardAddress: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
  },
  shopCardPrice: {
    color: colors.accent,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  shopCardRange: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
  },
  selectedCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardName: {
    color: '#FFFFFF',
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    flex: 1,
  },
  favoriteBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  favoriteBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  favoriteBtnTextActive: {
    color: colors.accent,
  },
  cardAddress: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  cardPhone: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  cardStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.xs,
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  addButton: {
    position: 'absolute',
    bottom: '46%',
    right: spacing.lg,
    width: 52,
    height: 52,
    backgroundColor: colors.accent,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: fontWeight.normal,
    textAlign: 'center',
    lineHeight: 32,
    marginTop: -2,
  },
  // 筛选相关样式
  filterBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: '70%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  filterTitle: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  closeBtn: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 20,
    padding: spacing.sm,
  },
  filterSection: {
    marginBottom: spacing.xl,
  },
  filterLabel: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  quickFilterBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'flex-start',
  },
  quickFilterBtnActive: {
    backgroundColor: 'rgba(255,107,53,0.2)',
    borderColor: colors.accent,
  },
  quickFilterText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
  },
  quickFilterTextActive: {
    color: colors.accent,
    fontWeight: fontWeight.medium,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(255,107,53,0.2)',
    borderColor: colors.accent,
  },
  filterChipText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
  },
  filterChipTextActive: {
    color: colors.accent,
    fontWeight: fontWeight.medium,
  },
  priceRangeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  priceChip: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  priceChipActive: {
    backgroundColor: 'rgba(255,107,53,0.2)',
    borderColor: colors.accent,
  },
  priceChipText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
  },
  priceChipTextActive: {
    color: colors.accent,
    fontWeight: fontWeight.medium,
  },
  filterFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  applyBtn: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});

export default MapScreen;
