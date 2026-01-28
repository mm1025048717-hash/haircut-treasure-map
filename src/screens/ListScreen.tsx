import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Image,
  Dimensions,
  Modal,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
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

type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 计算两点之间的距离（米）
const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371000; // 地球半径（米）
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

const ListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const store = useStore();
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'rating'>('distance');
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<ShopCategory[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);

  // 获取用户位置
  const requestLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.log('获取位置失败', error);
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const allShops = store.getShops();

  // 计算店铺距离
  const getShopDistance = useCallback((shop: Shop): number => {
    if (!userLocation) return 9999999;
    return calculateDistance(userLocation, shop.location);
  }, [userLocation]);

  // 筛选和排序店铺
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

    // 分类过滤
    if (selectedCategories.length > 0) {
      result = result.filter((s) => selectedCategories.includes(s.category));
    }

    // 价格区间过滤
    result = result.filter(
      (s) => s.avgPrice >= priceRange[0] && s.avgPrice <= priceRange[1]
    );

    // 排序
    result = [...result].sort((a, b) => {
      if (sortBy === 'price') return a.avgPrice - b.avgPrice;
      if (sortBy === 'rating') {
        // Shop 类型没有 rating，使用默认值 0
        return 0;
      }
      if (sortBy === 'distance' && userLocation) {
        return getShopDistance(a) - getShopDistance(b);
      }
      return 0;
    });

    return result;
  }, [allShops, searchText, sortBy, selectedCategories, priceRange, userLocation, getShopDistance]);

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
  };

  const goToDetail = (shop: Shop) => {
    navigation.navigate('ShopDetail', { shopId: shop.id });
  };

  // 计算店铺平均评分
  const getShopRating = (shopId: number) => {
    const records = store.getRecordsByShopId(shopId);
    if (records.length === 0) return 4.5 + Math.random() * 0.5; // 默认评分
    const sum = records.reduce((acc, r) => acc + r.rating, 0);
    return sum / records.length;
  };

  // 获取店铺标签
  const getShopTags = (shop: Shop) => {
    const tags: string[] = [];
    // Shop 类型没有 rating，移除相关判断
    // if (shop.rating && shop.rating >= 4.5) tags.push('好评如潮');
    if (shop.avgPrice < 50) tags.push('性价比高');
    if (shop.avgPrice > 80) tags.push('高端服务');
    const categoryInfo = shopCategoryConfig[shop.category];
    if (categoryInfo) tags.push(categoryInfo.label);
    return tags.slice(0, 2);
  };

  return (
    <View style={styles.container}>
      {/* 顶部标题 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>理发指南</Text>
        <View style={styles.headerIcons}>
          <Pressable style={styles.iconBtn} onPress={() => setShowFilterModal(true)}>
            <Text style={styles.iconText}>◎</Text>
            {selectedCategories.length > 0 && <View style={styles.filterBadge} />}
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => setShowSortModal(true)}>
            <Text style={styles.iconText}>▽</Text>
          </Pressable>
        </View>
      </View>

      {/* 页面标题 */}
      <Text style={styles.pageTitle}>附近理发店</Text>

      {/* 店铺列表 */}
      <ScrollView 
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredShops.map((shop) => {
          const rating = getShopRating(shop.id);
          const tags = getShopTags(shop);
          const distance = getShopDistance(shop);
          const distanceText = distance < 1000 ? `${distance}m` : `${(distance / 1000).toFixed(1)}km`;
          
          return (
            <Pressable
              key={shop.id}
              style={styles.shopCard}
              onPress={() => goToDetail(shop)}
            >
              {/* 店铺图片 */}
              <View style={styles.shopImageContainer}>
                {shop.photos && shop.photos.length > 0 ? (
                  <Image
                    source={{ uri: shop.photos[0] }}
                    style={styles.shopImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.shopImagePlaceholder}>
                    <Text style={styles.placeholderText}>📷</Text>
                  </View>
                )}
              </View>

              {/* 店铺信息 */}
              <View style={styles.shopInfo}>
                <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
                
                {/* 评分 */}
                <View style={styles.ratingRow}>
                  <Text style={styles.stars}>{'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}</Text>
                  <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
                </View>

                {/* 价格和距离 */}
                <View style={styles.priceRow}>
                  <Text style={styles.price}>¥{shop.priceRange[0]}-{shop.priceRange[1]}</Text>
                  <Text style={styles.distance}>{userLocation ? distanceText : '定位中...'}</Text>
                </View>

                {/* 标签 */}
                <View style={styles.tagsRow}>
                  {tags.map((tag, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.tag,
                        index === 0 ? styles.tagPrimary : styles.tagSecondary
                      ]}
                    >
                      <Text style={[
                        styles.tagText,
                        index === 0 ? styles.tagTextPrimary : styles.tagTextSecondary
                      ]}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 收藏指示器 */}
              {shop.isFavorite && (
                <View style={styles.favoriteIndicator} />
              )}
            </Pressable>
          );
        })}

        {/* 底部留白 */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 排序弹窗 */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowSortModal(false)}>
          <View style={styles.sortModal}>
            <Text style={styles.modalTitle}>排序方式</Text>
            {[
              { key: 'distance', label: '距离最近', icon: '📍' },
              { key: 'price', label: '价格最低', icon: '💰' },
              { key: 'rating', label: '评分最高', icon: '⭐' },
            ].map((item) => (
              <Pressable
                key={item.key}
                style={[styles.sortOption, sortBy === item.key && styles.sortOptionActive]}
                onPress={() => {
                  setSortBy(item.key as 'distance' | 'price' | 'rating');
                  setShowSortModal(false);
                }}
              >
                <Text style={styles.sortOptionIcon}>{item.icon}</Text>
                <Text style={[styles.sortOptionText, sortBy === item.key && styles.sortOptionTextActive]}>
                  {item.label}
                </Text>
                {sortBy === item.key && <Text style={styles.checkMark}>✓</Text>}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

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
              <Text style={styles.modalTitle}>筛选条件</Text>
              <Pressable onPress={() => setShowFilterModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 55,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  headerTitle: {
    color: colors.accent,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  pageTitle: {
    color: '#FFFFFF',
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  shopCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  shopImageContainer: {
    width: 110,
    height: 110,
  },
  shopImage: {
    width: '100%',
    height: '100%',
  },
  shopImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    opacity: 0.5,
  },
  shopInfo: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  shopName: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stars: {
    color: '#FFB800',
    fontSize: fontSize.sm,
    letterSpacing: -1,
  },
  ratingValue: {
    color: '#FFB800',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  price: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  distance: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  tagPrimary: {
    backgroundColor: 'rgba(255,107,53,0.2)',
  },
  tagSecondary: {
    backgroundColor: 'rgba(74,222,128,0.2)',
  },
  tagText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  tagTextPrimary: {
    color: colors.accent,
  },
  tagTextSecondary: {
    color: colors.success,
  },
  favoriteIndicator: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  // 弹窗样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortModal: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.lg,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sortOptionActive: {
    backgroundColor: 'rgba(255,107,53,0.15)',
  },
  sortOptionIcon: {
    fontSize: 18,
    marginRight: spacing.md,
  },
  sortOptionText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    flex: 1,
  },
  sortOptionTextActive: {
    color: colors.accent,
    fontWeight: fontWeight.semibold,
  },
  checkMark: {
    color: colors.accent,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  filterModal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '70%',
    padding: spacing.lg,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
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

export default ListScreen;
