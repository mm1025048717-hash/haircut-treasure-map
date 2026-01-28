import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Linking,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useStore, shopCategoryConfig } from '../store';
import { Barber, ExternalNote, HaircutRecord } from '../types';
import {
  colors,
  borderRadius,
  fontSize,
  fontWeight,
  spacing,
} from '../theme';
import AddRecordModal from '../components/AddRecordModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Web 友好的 Alert
const showAlert = (
  title: string,
  message: string,
  buttons?: { text: string; onPress?: () => void; style?: string }[]
) => {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 1) {
      const confirmed = window.confirm(`${title}\n${message}`);
      if (confirmed && buttons[1]?.onPress) {
        buttons[1].onPress();
      }
    } else {
      window.alert(`${title}\n${message}`);
      buttons?.[0]?.onPress?.();
    }
  } else {
    const { Alert } = require('react-native');
    Alert.alert(title, message, buttons);
  }
};

type ShopDetailRouteProp = RouteProp<RootStackParamList, 'ShopDetail'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

type ShopDetailProps = {
  route: ShopDetailRouteProp;
};

const ShopDetailScreen: React.FC<ShopDetailProps> = ({ route }) => {
  const { shopId } = route.params;
  const navigation = useNavigation<NavigationProp>();
  const store = useStore();
  const shop = store.getShopById(shopId);
  const barbers = store.getBarbersByShopId(shopId);
  const externalNotes = store.getNotesByShopId(shopId);
  const records = store.getRecordsByShopId(shopId);

  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'barbers' | 'notes' | 'records'>('barbers');

  if (!shop) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>店铺不存在</Text>
      </View>
    );
  }

  const categoryInfo = shopCategoryConfig[shop.category];

  // 计算平均评分
  const avgRating = useMemo(() => {
    if (records.length === 0) return 0;
    const sum = records.reduce((acc, r) => acc + r.rating, 0);
    return (sum / records.length).toFixed(1);
  }, [records]);

  const handleCall = () => {
    if (shop.phone) {
      showAlert('拨打电话', shop.phone, [
        { text: '取消', style: 'cancel' },
        { text: '拨打', onPress: () => Linking.openURL(`tel:${shop.phone}`) },
      ]);
    } else {
      showAlert('提示', '该店铺暂无联系电话');
    }
  };

  const handleToggleFavorite = () => {
    store.toggleFavorite(shopId);
  };

  const goToBarber = (barber: Barber) => {
    navigation.navigate('BarberDetail', { barberId: barber.id });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 店铺照片轮播 */}
      {shop.photos && shop.photos.length > 0 && (
        <View style={styles.photoGallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentPhotoIndex(index);
            }}
          >
            {shop.photos.map((photo, index) => (
              <Image
                key={index}
                source={{ uri: photo }}
                style={styles.galleryImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          {shop.photos.length > 1 && (
            <View style={styles.photoIndicator}>
              {shop.photos.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicatorDot,
                    currentPhotoIndex === index && styles.indicatorDotActive,
                  ]}
                />
              ))}
            </View>
          )}
          {/* 店铺类型标签 */}
          <View style={[styles.categoryBadge, { backgroundColor: categoryInfo?.color || colors.border }]}>
            <Text style={styles.categoryBadgeText}>{categoryInfo?.label || '其他'}</Text>
          </View>
        </View>
      )}

      {/* 头部信息 */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.shopName}>{shop.name}</Text>
          <Pressable style={styles.favoriteBtn} onPress={handleToggleFavorite}>
            <Text style={[styles.favoriteBtnText, shop.isFavorite && styles.favoriteBtnTextActive]}>
              {shop.isFavorite ? '已收藏' : '收藏'}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.addressText}>{shop.address}</Text>
        {shop.phone && (
          <Pressable onPress={handleCall}>
            <Text style={styles.phoneText}>{shop.phone}</Text>
          </Pressable>
        )}

        {/* 标签 */}
        {shop.tags.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
            {shop.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* 核心数据 */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>¥{shop.avgPrice}</Text>
            <Text style={styles.statLabel}>均价</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              ¥{shop.priceRange[0]}-{shop.priceRange[1]}
            </Text>
            <Text style={styles.statLabel}>价格区间</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{avgRating || '-'}</Text>
            <Text style={styles.statLabel}>评分</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{barbers.length}</Text>
            <Text style={styles.statLabel}>理发师</Text>
          </View>
        </View>
      </View>

      {/* 操作按钮 */}
      <View style={styles.actionBar}>
        <Pressable style={styles.actionBtn} onPress={handleToggleFavorite}>
          <Text style={[styles.actionText, shop.isFavorite && styles.actionTextActive]}>
            {shop.isFavorite ? '已收藏' : '收藏'}
          </Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={handleCall}>
          <Text style={styles.actionText}>电话</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, styles.actionBtnPrimary]}
          onPress={() => setShowAddRecordModal(true)}
        >
          <Text style={styles.actionTextPrimary}>记录理发</Text>
        </Pressable>
      </View>

      {/* Tab 切换 */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === 'barbers' && styles.tabActive]}
          onPress={() => setActiveTab('barbers')}
        >
          <Text style={[styles.tabText, activeTab === 'barbers' && styles.tabTextActive]}>
            理发师 ({barbers.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'notes' && styles.tabActive]}
          onPress={() => setActiveTab('notes')}
        >
          <Text style={[styles.tabText, activeTab === 'notes' && styles.tabTextActive]}>
            笔记评价 ({externalNotes.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'records' && styles.tabActive]}
          onPress={() => setActiveTab('records')}
        >
          <Text style={[styles.tabText, activeTab === 'records' && styles.tabTextActive]}>
            我的记录 ({records.length})
          </Text>
        </Pressable>
      </View>

      {/* Tab 内容 */}
      <View style={styles.tabContent}>
        {activeTab === 'barbers' && (
          <View>
            {barbers.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>暂无理发师信息</Text>
              </View>
            ) : (
              barbers.map((barber) => (
                <BarberCard key={barber.id} barber={barber} onPress={() => goToBarber(barber)} />
              ))
            )}
          </View>
        )}

        {activeTab === 'notes' && (
          <View>
            {externalNotes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>暂无笔记评价</Text>
                <Text style={styles.emptyHint}>小红书和大众点评的相关内容将在此展示</Text>
              </View>
            ) : (
              externalNotes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))
            )}
          </View>
        )}

        {activeTab === 'records' && (
          <View>
            {records.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>暂无理发记录</Text>
                <Pressable
                  style={styles.emptyAddBtn}
                  onPress={() => setShowAddRecordModal(true)}
                >
                  <Text style={styles.emptyAddBtnText}>添加记录</Text>
                </Pressable>
              </View>
            ) : (
              records.map((record) => (
                <RecordCard key={record.id} record={record} store={store} />
              ))
            )}
          </View>
        )}
      </View>

      {/* 底部留白 */}
      <View style={{ height: 40 }} />

      {/* 添加记录弹窗 */}
      <AddRecordModal
        visible={showAddRecordModal}
        onClose={() => setShowAddRecordModal(false)}
        preSelectedShopId={shopId}
      />
    </ScrollView>
  );
};

// 理发师卡片
const BarberCard: React.FC<{ barber: Barber; onPress: () => void }> = ({ barber, onPress }) => {
  return (
    <Pressable style={styles.barberCard} onPress={onPress}>
      <Image source={{ uri: barber.avatar }} style={styles.barberAvatar} />
      <View style={styles.barberInfo}>
        <View style={styles.barberHeader}>
          <Text style={styles.barberName}>{barber.name}</Text>
          {barber.isRecommended && (
            <View style={styles.recommendBadge}>
              <Text style={styles.recommendBadgeText}>推荐</Text>
            </View>
          )}
        </View>
        <Text style={styles.barberMeta}>
          {barber.gender === 'male' ? '男' : '女'} · {barber.age}岁 · {barber.yearsOfExperience}年经验
        </Text>
        <View style={styles.barberSpecialties}>
          {barber.specialties.slice(0, 3).map((s, i) => (
            <Text key={i} style={styles.specialtyTag}>{s}</Text>
          ))}
        </View>
        <View style={styles.barberStats}>
          <Text style={styles.barberRating}>⭐ {barber.rating}</Text>
          <Text style={styles.barberRatingCount}>({barber.ratingCount}条评价)</Text>
          <Text style={styles.barberPrice}>¥{barber.priceRange[0]}-{barber.priceRange[1]}</Text>
        </View>
      </View>
      <Text style={styles.barberArrow}>›</Text>
    </Pressable>
  );
};

// 外部笔记卡片
const NoteCard: React.FC<{ note: ExternalNote }> = ({ note }) => {
  const platformInfo = note.platform === 'xiaohongshu' 
    ? { name: '小红书', color: '#FE2C55' }
    : { name: '大众点评', color: '#FF6633' };

  return (
    <View style={styles.noteCard}>
      <View style={styles.noteHeader}>
        <Image source={{ uri: note.authorAvatar }} style={styles.noteAvatar} />
        <View style={styles.noteAuthorInfo}>
          <Text style={styles.noteAuthorName}>{note.authorName}</Text>
          <View style={[styles.platformBadge, { backgroundColor: platformInfo.color }]}>
            <Text style={styles.platformBadgeText}>{platformInfo.name}</Text>
          </View>
        </View>
        {note.rating && (
          <View style={styles.noteRating}>
            <Text style={styles.noteRatingText}>{'★'.repeat(note.rating)}</Text>
          </View>
        )}
      </View>

      <Text style={styles.noteContent} numberOfLines={4}>{note.content}</Text>

      {note.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.noteImages}>
          {note.images.map((img, index) => (
            <Image key={index} source={{ uri: img }} style={styles.noteImage} />
          ))}
        </ScrollView>
      )}

      <View style={styles.noteFooter}>
        <View style={styles.noteTags}>
          {note.tags.slice(0, 3).map((tag, i) => (
            <Text key={i} style={styles.noteTag}>#{tag}</Text>
          ))}
        </View>
        <Text style={styles.noteLikes}>❤️ {note.likes}</Text>
      </View>
    </View>
  );
};

// 理发记录卡片
const RecordCard: React.FC<{ record: HaircutRecord; store: any }> = ({ record, store }) => {
  const barber = record.barberId ? store.getBarberById(record.barberId) : null;

  return (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View>
          <Text style={styles.recordDate}>
            {new Date(record.date).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          {barber && <Text style={styles.recordBarber}>理发师：{barber.name}</Text>}
        </View>
        <Text style={styles.recordPrice}>¥{record.price}</Text>
      </View>

      <Text style={styles.recordServices}>{record.services.join(' · ')}</Text>

      <View style={styles.recordRating}>
        <Text style={styles.ratingStars}>
          {'★'.repeat(record.rating)}{'☆'.repeat(5 - record.rating)}
        </Text>
      </View>

      {record.note && (
        <Text style={styles.recordNote}>{record.note}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 100,
  },
  photoGallery: {
    height: 220,
    backgroundColor: colors.surfaceLight,
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: 220,
  },
  photoIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  indicatorDotActive: {
    backgroundColor: '#fff',
    width: 20,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: fontSize.lg,
  },
  header: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  shopName: {
    color: '#FFFFFF',
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    flex: 1,
  },
  favoriteIcon: {
    fontSize: 28,
    marginLeft: spacing.sm,
  },
  favoriteBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
  addressText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  phoneText: {
    color: colors.accent,
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  tagsScroll: {
    marginBottom: spacing.md,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
  actionBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: borderRadius.md,
  },
  actionBtnPrimary: {
    flex: 1.5,
    backgroundColor: colors.accent,
  },
  actionIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  actionIconPrimary: {
    fontSize: 18,
    marginBottom: 2,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
  },
  actionTextActive: {
    color: colors.accent,
  },
  actionTextPrimary: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.accent,
  },
  tabText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  tabTextActive: {
    color: colors.accent,
  },
  tabContent: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    minHeight: 200,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.lg,
  },
  emptyHint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  emptyAddBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },

  // 理发师卡片样式
  barberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  barberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: spacing.md,
  },
  barberInfo: {
    flex: 1,
  },
  barberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  barberName: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  recommendBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: spacing.sm,
  },
  recommendBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: fontWeight.medium,
  },
  barberMeta: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  barberSpecialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.xs,
  },
  specialtyTag: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  barberStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barberRating: {
    color: colors.warning,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  barberRatingCount: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.xs,
    marginLeft: 4,
  },
  barberPrice: {
    color: colors.accent,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginLeft: 'auto',
  },
  barberArrow: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 24,
    marginLeft: spacing.sm,
  },

  // 外部笔记卡片样式
  noteCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  noteAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.md,
  },
  noteAuthorInfo: {
    flex: 1,
  },
  noteAuthorName: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  platformBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  platformBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  noteRating: {
    marginLeft: 'auto',
  },
  noteRatingText: {
    color: colors.warning,
    fontSize: fontSize.sm,
  },
  noteContent: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.sm,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  noteImages: {
    marginBottom: spacing.md,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  noteImage: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  noteTag: {
    color: colors.accent,
    fontSize: fontSize.xs,
    marginRight: spacing.sm,
  },
  noteLikes: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.xs,
  },

  // 理发记录卡片样式
  recordCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  recordDate: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.sm,
  },
  recordBarber: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.xs,
    marginTop: 4,
  },
  recordPrice: {
    color: colors.accent,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  recordServices: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  recordRating: {
    marginBottom: spacing.sm,
  },
  ratingStars: {
    color: colors.warning,
    fontSize: fontSize.lg,
  },
  recordNote: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: fontSize.sm,
    lineHeight: 22,
  },
});

export default ShopDetailScreen;
