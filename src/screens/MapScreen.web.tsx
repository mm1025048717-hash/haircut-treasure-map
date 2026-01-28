import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useStore, shopCategoryConfig } from '../store';
import { Shop, ShopCategory } from '../types';
import { colors, borderRadius, fontSize, fontWeight, spacing } from '../theme';
import AddShopModal from '../components/AddShopModal';

// Leaflet 类型声明
declare global {
  interface Window {
    L?: any;
  }
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 北京中心坐标
const DEFAULT_CENTER: [number, number] = [39.9087, 116.3975];
const DEFAULT_ZOOM = 13;

const MapScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const store = useStore();
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [searchText, setSearchText] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showAddShopModal, setShowAddShopModal] = useState(false);

  // 获取店铺列表
  const allShops = store.getShops() || [];

  // 筛选店铺
  const filteredShops = useMemo(() => {
    let result = allShops;

    // 搜索过滤
    if (searchText.trim()) {
      const keyword = searchText.toLowerCase();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(keyword) ||
          s.address?.toLowerCase().includes(keyword)
      );
    }

    // 只看收藏
    if (showFavoritesOnly) {
      result = result.filter((s) => s.isFavorite);
    }

    return result;
  }, [allShops, searchText, showFavoritesOnly]);

  const handleShopPress = (shop: Shop) => {
    setSelectedShop(shop);
    // 移动地图到选中店铺
    if (mapRef.current && shop.location) {
      mapRef.current.setView([shop.location.latitude, shop.location.longitude], 15);
    }
  };

  const goToDetail = (shop: Shop) => {
    navigation.navigate('ShopDetail', { shopId: shop.id });
  };

  const handleToggleFavorite = (shop: Shop) => {
    store.toggleFavorite(shop.id);
    if (selectedShop?.id === shop.id) {
      setSelectedShop(store.getShopById(shop.id) || null);
    }
  };

  // 初始化 Leaflet 地图
  useEffect(() => {
    const initMap = () => {
      if (!window.L || mapRef.current) return;

      const container = document.getElementById('leaflet-map');
      if (!container) return;

      // 创建地图
      const map = window.L.map('leaflet-map', {
        zoomControl: true,
        attributionControl: false,
      }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

      // 使用 OpenStreetMap 瓦片
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      
      // 延迟设置 ready 状态，确保地图完全加载
      setTimeout(() => {
        map.invalidateSize();
        setMapReady(true);
      }, 100);
    };

    // 加载 Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // 加载 Leaflet JS
    if (window.L) {
      initMap();
    } else if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 窗口大小变化时重新调整地图
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 更新标记点
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    // 清除旧标记
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // 添加新标记
    filteredShops.forEach((shop) => {
      if (!shop.location) return;
      
      const isFavorite = shop.isFavorite;
      const isSelected = selectedShop?.id === shop.id;
      const bgColor = isSelected ? colors.accent : (isFavorite ? colors.accentLight : colors.surface);
      const textColor = isSelected || isFavorite ? '#fff' : colors.textPrimary;

      // 极简文字标记
      const icon = window.L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            min-width: 24px;
            height: 24px;
            padding: 0 8px;
            background: ${bgColor};
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 600;
            color: ${textColor};
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            cursor: pointer;
            white-space: nowrap;
          ">${shop.name?.slice(0, 4) || '店铺'}</div>
        `,
        iconSize: [60, 24],
        iconAnchor: [30, 12],
      });

      const marker = window.L.marker([shop.location.latitude, shop.location.longitude], { icon })
        .addTo(mapRef.current)
        .on('click', () => handleShopPress(shop));

      markersRef.current.push(marker);
    });
  }, [filteredShops, mapReady, selectedShop]);

  const recordCount = selectedShop
    ? store.getRecordsByShopId(selectedShop.id).length
    : 0;

  // 安全获取价格区间
  const getPriceRange = (shop: Shop) => {
    if (!shop.priceRange || !Array.isArray(shop.priceRange) || shop.priceRange.length < 2) {
      return { min: 0, max: 0 };
    }
    return { min: shop.priceRange[0], max: shop.priceRange[1] };
  };

  // 安全获取分类配置
  const getCategoryConfig = (category: string) => {
    const config = shopCategoryConfig?.[category as ShopCategory];
    return config || { label: '其他', color: colors.border };
  };

  return (
    <View style={styles.container}>
      {/* 顶部搜索栏 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>理发地图</Text>
      </View>
      
      <View style={styles.searchBar}>
        <View style={styles.searchInputWrap}>
          <TextInput
            style={styles.searchInput}
            placeholder="搜索店铺..."
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <Pressable
          style={[styles.filterBtn, showFavoritesOnly && styles.filterBtnActive]}
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <Text style={[styles.filterBtnText, showFavoritesOnly && styles.filterBtnTextActive]}>
            收藏
          </Text>
        </Pressable>
      </View>

      {/* 地图区域 - 自适应高度 */}
      <View style={styles.mapContainer}>
        <View nativeID="leaflet-map" style={styles.map} />
        {!mapReady && (
          <View style={styles.mapLoading}>
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        )}
      </View>

      {/* 底部店铺列表 */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>
          {selectedShop ? '店铺详情' : `附近 ${filteredShops.length} 家`}
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
                <Text style={styles.statValue}>¥{selectedShop.avgPrice || 0}</Text>
                <Text style={styles.statLabel}>均价</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  ¥{getPriceRange(selectedShop).min}-{getPriceRange(selectedShop).max}
                </Text>
                <Text style={styles.statLabel}>区间</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{recordCount}</Text>
                <Text style={styles.statLabel}>记录</Text>
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
            {filteredShops.map((shop) => {
              const categoryConfig = getCategoryConfig(shop.category);
              return (
                <Pressable
                  key={shop.id}
                  style={styles.shopCard}
                  onPress={() => handleShopPress(shop)}
                >
                  <View style={styles.shopCardContent}>
                    <View style={styles.shopCardHeader}>
                      <Text style={styles.shopCardName} numberOfLines={1}>{shop.name}</Text>
                      {shop.isFavorite && (
                        <View style={styles.favoriteDot} />
                      )}
                    </View>
                    <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.color + '30' }]}>
                      <Text style={[styles.categoryBadgeText, { color: categoryConfig.color }]}>
                        {categoryConfig.label}
                      </Text>
                    </View>
                    <Text style={styles.shopCardAddress} numberOfLines={1}>
                      {shop.address}
                    </Text>
                    <Text style={styles.shopCardPrice}>
                      ¥{shop.avgPrice || 0}
                      <Text style={styles.shopCardRange}>
                        {' '}({getPriceRange(shop).min}-{getPriceRange(shop).max})
                      </Text>
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* 添加店铺按钮 */}
      {!selectedShop && (
        <Pressable
          style={styles.addButton}
          onPress={() => setShowAddShopModal(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      )}

      {/* 添加店铺弹窗 */}
      <AddShopModal
        visible={showAddShopModal}
        onClose={() => setShowAddShopModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  searchBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  searchInputWrap: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    height: 36,
    color: colors.textPrimary,
    fontSize: fontSize.sm,
  },
  filterBtn: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.md,
    height: 36,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: colors.accent,
  },
  filterBtnText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  filterBtnTextActive: {
    color: '#fff',
  },
  mapContainer: {
    flex: 1,
    minHeight: SCREEN_HEIGHT * 0.45,
    backgroundColor: colors.primaryDark,
  },
  map: {
    width: '100%',
    height: '100%',
    position: 'absolute' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mapLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  bottomSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    marginTop: -spacing.md,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    minHeight: 180,
  },
  sheetHandle: {
    width: 32,
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  sheetTitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.md,
  },
  shopList: {
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  shopCard: {
    width: 160,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
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
    color: colors.textPrimary,
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
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  categoryBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  shopCardAddress: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  shopCardPrice: {
    color: colors.accent,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  shopCardRange: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
  },
  selectedCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardName: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    flex: 1,
  },
  favoriteBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
  },
  favoriteBtnText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  favoriteBtnTextActive: {
    color: colors.accent,
  },
  cardAddress: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  cardPhone: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  cardStats: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  primaryBtn: {
    flex: 2,
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  addButton: {
    position: 'absolute',
    bottom: 200,
    right: spacing.lg,
    width: 44,
    height: 44,
    backgroundColor: colors.accent,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: fontWeight.normal,
    lineHeight: 26,
  },
});

export default MapScreen;
