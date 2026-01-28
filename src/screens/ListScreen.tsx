import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useStore, shopCategoryConfig } from '../store';
import { Shop } from '../types';
import {
  colors,
  borderRadius,
  fontSize,
  fontWeight,
  spacing,
} from '../theme';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const store = useStore();
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'rating'>('distance');

  const allShops = store.getShops();

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

    // 排序
    result = [...result].sort((a, b) => {
      if (sortBy === 'price') return a.avgPrice - b.avgPrice;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0; // distance - 默认顺序
    });

    return result;
  }, [allShops, searchText, sortBy]);

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
    if (shop.rating && shop.rating >= 4.5) tags.push('好评如潮');
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
        <Text style={styles.headerTitle}>理发藏宝图</Text>
        <View style={styles.headerIcons}>
          <Pressable style={styles.iconBtn}>
            <Text style={styles.iconText}>◎</Text>
          </Pressable>
          <Pressable style={styles.iconBtn}>
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
          const distance = Math.round(300 + Math.random() * 1200);
          
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
                  <Text style={styles.distance}>{distance}m</Text>
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
});

export default ListScreen;
