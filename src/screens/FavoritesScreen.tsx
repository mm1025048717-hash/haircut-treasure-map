import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useStore } from '../store';
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
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 3) / 2;

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const store = useStore();
  const favoriteShops = store.getFavoriteShops();

  const goToDetail = (shop: Shop) => {
    navigation.navigate('ShopDetail', { shopId: shop.id });
  };

  const goToDiscover = () => {
    // 切换到地图页面
    navigation.getParent()?.navigate('Map');
  };

  // 获取店铺评分
  const getShopRating = (shopId: number) => {
    const records = store.getRecordsByShopId(shopId);
    if (records.length === 0) return 4.5 + Math.random() * 0.5;
    const sum = records.reduce((acc, r) => acc + r.rating, 0);
    return sum / records.length;
  };

  return (
    <View style={styles.container}>
      {/* 顶部导航 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.backArrow}>‹</Text>
        </View>
        <Text style={styles.headerTitle}>我的收藏</Text>
        <View style={styles.headerRight}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>✂</Text>
            <Text style={styles.logoText}>理发藏宝图</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {favoriteShops.length === 0 ? (
          /* 空状态 */
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>♡</Text>
            <Text style={styles.emptyTitle}>还没有收藏店铺</Text>
            <Text style={styles.emptySubtitle}>去发现好店，点击收藏保存</Text>
            <Pressable style={styles.discoverBtn} onPress={goToDiscover}>
              <Text style={styles.discoverBtnText}>去发现</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* 收藏网格 */}
            <View style={styles.grid}>
              {favoriteShops.map((shop) => {
                const rating = getShopRating(shop.id);
                
                return (
                  <Pressable
                    key={shop.id}
                    style={styles.card}
                    onPress={() => goToDetail(shop)}
                  >
                    {/* 店铺图片 */}
                    <View style={styles.imageContainer}>
                      {shop.photos && shop.photos.length > 0 ? (
                        <Image
                          source={{ uri: shop.photos[0] }}
                          style={styles.cardImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.imagePlaceholder}>
                          <Text style={styles.placeholderIcon}>✂</Text>
                        </View>
                      )}
                    </View>

                    {/* 店铺信息 */}
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardName} numberOfLines={1}>{shop.name}</Text>
                      <View style={styles.cardBottom}>
                        <View style={styles.ratingContainer}>
                          <Text style={styles.star}>★</Text>
                          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
                          <Text style={styles.ratingStars}>{'★'.repeat(Math.floor(rating))}</Text>
                        </View>
                        <Pressable 
                          style={styles.heartBtn}
                          onPress={() => store.toggleFavorite(shop.id)}
                        >
                          <Text style={styles.heartIcon}>♥</Text>
                        </Pressable>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* 底部提示 */}
            <View style={styles.bottomSection}>
              <Text style={styles.bottomText}>继续探索更多好店</Text>
              <Pressable style={styles.discoverBtn} onPress={goToDiscover}>
                <Text style={styles.discoverBtnText}>去发现</Text>
              </Pressable>
            </View>
          </>
        )}

        {/* 底部留白 */}
        <View style={{ height: 120 }} />
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
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  headerLeft: {
    width: 40,
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: fontWeight.normal,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 80,
    alignItems: 'flex-end',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 20,
    color: colors.accent,
  },
  logoText: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    color: 'rgba(255,255,255,0.2)',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.sm,
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#1A1A2E',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.75,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
    color: 'rgba(255,255,255,0.2)',
  },
  cardInfo: {
    padding: spacing.md,
  },
  cardName: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  star: {
    color: '#FFB800',
    fontSize: fontSize.sm,
  },
  ratingText: {
    color: '#FFB800',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  ratingStars: {
    color: '#FFB800',
    fontSize: 10,
    letterSpacing: -1,
  },
  heartBtn: {
    padding: 4,
  },
  heartIcon: {
    color: colors.accent,
    fontSize: 18,
  },
  bottomSection: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  bottomText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  discoverBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  discoverBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});

export default FavoritesScreen;
