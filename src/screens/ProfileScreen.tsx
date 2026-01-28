import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useStore } from '../store';
import {
  colors,
  borderRadius,
  fontSize,
  fontWeight,
  spacing,
} from '../theme';
import AddRecordModal from '../components/AddRecordModal';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const store = useStore();
  const records = store.getAllRecords();
  const favoriteShops = store.getFavoriteShops();

  const [showAddRecordModal, setShowAddRecordModal] = useState(false);

  // 统计数据
  const totalSpent = records.reduce((sum, r) => sum + r.price, 0);
  const avgPrice = records.length > 0 ? Math.round(totalSpent / records.length) : 0;

  // 获取记录对应的店铺名称
  const getShopName = (shopId: number) => {
    const shop = store.getShopById(shopId);
    return shop?.name || '未知店铺';
  };

  // 跳转到店铺详情
  const goToShopDetail = (shopId: number) => {
    navigation.navigate('ShopDetail', { shopId });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 页面标题 */}
      <Text style={styles.pageTitle}>我的记录</Text>

      {/* 统计卡片 */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>理发统计</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{records.length}</Text>
            <Text style={styles.statLabel}>次理发</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>¥{totalSpent}</Text>
            <Text style={styles.statLabel}>总花费</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>¥{avgPrice}</Text>
            <Text style={styles.statLabel}>均价</Text>
          </View>
        </View>
      </View>

      {/* 收藏的店铺 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>收藏的店铺 ({favoriteShops.length})</Text>
        {favoriteShops.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>还没有收藏店铺</Text>
          </View>
        ) : (
          <View style={styles.favoriteList}>
            {favoriteShops.map((shop) => (
              <Pressable
                key={shop.id}
                style={styles.favoriteItem}
                onPress={() => goToShopDetail(shop.id)}
              >
                <View style={styles.favoriteInfo}>
                  <Text style={styles.favoriteName}>{shop.name}</Text>
                  <Text style={styles.favoriteAddress}>{shop.address}</Text>
                </View>
                <View style={styles.favoriteRight}>
                  <Text style={styles.favoritePrice}>¥{shop.avgPrice}</Text>
                  <Text style={styles.favoriteArrow}>›</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* 理发记录时间线 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>理发记录</Text>
          <Pressable
            style={styles.addRecordBtnSmall}
            onPress={() => setShowAddRecordModal(true)}
          >
            <Text style={styles.addRecordBtnSmallText}>+ 添加</Text>
          </Pressable>
        </View>
        {records.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>还没有理发记录</Text>
            <Text style={styles.emptyHint}>点击下方按钮开始记录</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {records.map((record, index) => (
              <Pressable
                key={record.id}
                style={styles.timelineItem}
                onPress={() => goToShopDetail(record.shopId)}
              >
                <View style={styles.timelineDot} />
                {index < records.length - 1 && <View style={styles.timelineLine} />}
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineDate}>
                    {new Date(record.date).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                  <View style={styles.recordCard}>
                    <View style={styles.recordHeader}>
                      <Text style={styles.recordShop}>{getShopName(record.shopId)}</Text>
                      <Text style={styles.recordPrice}>¥{record.price}</Text>
                    </View>
                    <Text style={styles.recordServices}>
                      {record.services.join(' · ')}
                    </Text>
                    <View style={styles.recordRating}>
                      <Text style={styles.ratingText}>
                        评分 {record.rating}/5
                      </Text>
                    </View>
                    {record.note && (
                      <Text style={styles.recordNote} numberOfLines={2}>
                        {record.note}
                      </Text>
                    )}
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* 添加记录按钮 */}
      <Pressable
        style={styles.addButton}
        onPress={() => setShowAddRecordModal(true)}
      >
        <Text style={styles.addButtonText}>添加记录</Text>
      </Pressable>

      <View style={{ height: 40 }} />

      {/* 添加记录弹窗 */}
      <AddRecordModal
        visible={showAddRecordModal}
        onClose={() => setShowAddRecordModal(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: 60,
    paddingBottom: 100,
  },
  pageTitle: {
    color: '#FFFFFF',
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xl,
    letterSpacing: 1,
  },
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  statsTitle: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statValue: {
    color: colors.accent,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.xs,
    marginTop: 6,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  addRecordBtnSmall: {
    backgroundColor: 'rgba(255,107,53,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  addRecordBtnSmallText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: borderRadius.lg,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.md,
  },
  emptyHint: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  favoriteList: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteName: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  favoriteAddress: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.sm,
    marginTop: 4,
  },
  favoriteRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoritePrice: {
    color: colors.accent,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  favoriteArrow: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: fontSize.xxl,
    marginLeft: spacing.sm,
  },
  timeline: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    position: 'relative',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    marginTop: 6,
    marginRight: spacing.md,
    zIndex: 1,
  },
  timelineLine: {
    position: 'absolute',
    left: 4,
    top: 18,
    bottom: -spacing.lg,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  timelineContent: {
    flex: 1,
  },
  timelineDate: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
  },
  recordCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  recordShop: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  recordPrice: {
    color: colors.accent,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  recordServices: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  recordRating: {
    marginBottom: spacing.sm,
  },
  ratingText: {
    color: colors.warning,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  recordNote: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    shadowColor: colors.accent,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});

export default ProfileScreen;
