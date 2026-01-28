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

  // 菜单项配置
  const menuItems = [
    { icon: '♡', label: '我的收藏', value: favoriteShops.length },
    { icon: '☆', label: '我的评价', value: records.length },
    { icon: '📅', label: '预约记录', value: 0 },
    { icon: '⚙', label: '设置', value: null },
    { icon: 'ℹ', label: '关于我们', value: null },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 顶部标题 */}
      <Text style={styles.headerTitle}>理发藏宝图</Text>

      {/* 用户信息卡片 */}
      <View style={styles.userCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>用户12345</Text>
          <View style={styles.memberBadge}>
            <Text style={styles.memberIcon}>👑</Text>
            <Text style={styles.memberText}>会员</Text>
          </View>
        </View>
      </View>

      {/* 统计数据 */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{favoriteShops.length}</Text>
          <Text style={styles.statLabel}>收藏</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{records.length}</Text>
          <Text style={styles.statLabel}>评价</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>预约</Text>
        </View>
      </View>

      {/* 菜单列表 */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <Pressable key={index} style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <View style={styles.menuRight}>
              {item.value !== null && (
                <Text style={styles.menuValue}>{item.value > 0 ? item.value : ''}</Text>
              )}
              <Text style={styles.menuArrow}>›</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={{ height: 120 }} />

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
    paddingTop: 55,
    paddingBottom: 100,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    marginRight: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    fontSize: 28,
    color: 'rgba(255,255,255,0.5)',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,183,0,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  memberIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  memberText: {
    color: '#FFB700',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.xs,
    marginTop: 4,
  },
  menuContainer: {
    paddingHorizontal: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.6)',
    marginRight: spacing.md,
    width: 28,
    textAlign: 'center',
  },
  menuLabel: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuValue: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.sm,
    marginRight: spacing.sm,
  },
  menuArrow: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 24,
  },
});

export default ProfileScreen;
