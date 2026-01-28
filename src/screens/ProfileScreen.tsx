import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  Alert,
  Platform,
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

// Web 兼容的 Alert
const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const store = useStore();
  const records = store.getAllRecords();
  const favoriteShops = store.getFavoriteShops();

  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);
  
  // 设置状态
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  
  // 模拟预约数据
  const [appointments, setAppointments] = useState([
    { id: 1, shopName: '长安路老理发', date: '2026-01-30', time: '14:00', status: 'pending' as const },
    { id: 2, shopName: '胡同手艺社', date: '2026-02-05', time: '10:30', status: 'confirmed' as const },
  ]);

  // 统计数据
  const totalSpent = records.reduce((sum, r) => sum + r.price, 0);
  const avgPrice = records.length > 0 ? Math.round(totalSpent / records.length) : 0;

  // 获取店铺名称
  const getShopName = (shopId: number) => {
    const shop = store.getShopById(shopId);
    return shop?.name || '未知店铺';
  };

  // 取消预约
  const cancelAppointment = (id: number) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    showAlert('提示', '预约已取消');
  };

  // 菜单点击处理
  const handleMenuPress = (label: string) => {
    switch (label) {
      case '我的收藏':
        // 跳转到收藏页面
        (navigation as any).navigate('Favorites');
        break;
      case '我的评价':
        setShowRecordsModal(true);
        break;
      case '预约记录':
        setShowAppointmentsModal(true);
        break;
      case '设置':
        setShowSettingsModal(true);
        break;
      case '关于我们':
        setShowAboutModal(true);
        break;
    }
  };

  // 菜单项配置
  const menuItems = [
    { icon: '♡', label: '我的收藏', value: favoriteShops.length },
    { icon: '☆', label: '我的评价', value: records.length },
    { icon: '📅', label: '预约记录', value: appointments.length },
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
          <Pressable 
            key={index} 
            style={styles.menuItem}
            onPress={() => handleMenuPress(item.label)}
          >
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

      {/* 设置弹窗 */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>设置</Text>
              <Pressable onPress={() => setShowSettingsModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>
            <Pressable 
              style={styles.settingItem}
              onPress={() => setNotificationEnabled(!notificationEnabled)}
            >
              <Text style={styles.settingLabel}>通知推送</Text>
              <View style={[styles.toggleSwitch, notificationEnabled && styles.toggleSwitchActive]}>
                <View style={[styles.toggleThumb, notificationEnabled && styles.toggleThumbActive]} />
              </View>
            </Pressable>
            <Pressable 
              style={styles.settingItem}
              onPress={() => setLocationEnabled(!locationEnabled)}
            >
              <Text style={styles.settingLabel}>位置服务</Text>
              <View style={[styles.toggleSwitch, locationEnabled && styles.toggleSwitchActive]}>
                <View style={[styles.toggleThumb, locationEnabled && styles.toggleThumbActive]} />
              </View>
            </Pressable>
            <Pressable 
              style={styles.settingItem}
              onPress={() => setDarkModeEnabled(!darkModeEnabled)}
            >
              <Text style={styles.settingLabel}>深色模式</Text>
              <View style={[styles.toggleSwitch, darkModeEnabled && styles.toggleSwitchActive]}>
                <View style={[styles.toggleThumb, darkModeEnabled && styles.toggleThumbActive]} />
              </View>
            </Pressable>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>清除缓存</Text>
              <Pressable onPress={() => {
                store.clearCache?.();
                showAlert('提示', '缓存已清除');
              }}>
                <Text style={styles.settingAction}>清除</Text>
              </Pressable>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>版本</Text>
              <Text style={styles.settingValue}>1.0.0</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* 关于我们弹窗 */}
      <Modal
        visible={showAboutModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>关于我们</Text>
              <Pressable onPress={() => setShowAboutModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>
            <View style={styles.aboutContent}>
              <Text style={styles.aboutLogo}>✂️</Text>
              <Text style={styles.aboutName}>理发藏宝图</Text>
              <Text style={styles.aboutVersion}>版本 1.0.0</Text>
              <Text style={styles.aboutDesc}>
                理发藏宝图是一款帮助用户发现附近优质理发店的应用。
                记录每次理发体验，找到最适合你的理发师！
              </Text>
              <Text style={styles.aboutContact}>联系我们：18384666818</Text>
              <Text style={styles.aboutCopyright}>© 2024 理发藏宝图团队</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* 我的评价/记录弹窗 */}
      <Modal
        visible={showRecordsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRecordsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>我的评价</Text>
              <Pressable onPress={() => setShowRecordsModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.recordsList}>
              {records.length === 0 ? (
                <View style={styles.emptyRecords}>
                  <Text style={styles.emptyText}>暂无评价记录</Text>
                  <Pressable 
                    style={styles.addRecordBtn}
                    onPress={() => {
                      setShowRecordsModal(false);
                      setShowAddRecordModal(true);
                    }}
                  >
                    <Text style={styles.addRecordBtnText}>添加记录</Text>
                  </Pressable>
                </View>
              ) : (
                records.map((record) => (
                  <View key={record.id} style={styles.recordItem}>
                    <View style={styles.recordHeader}>
                      <Text style={styles.recordShop}>{getShopName(record.shopId)}</Text>
                      <Text style={styles.recordPrice}>¥{record.price}</Text>
                    </View>
                    <Text style={styles.recordDate}>
                      {new Date(record.date).toLocaleDateString('zh-CN')}
                    </Text>
                    <Text style={styles.recordServices}>{record.services.join(' · ')}</Text>
                    <Text style={styles.recordRating}>
                      {'★'.repeat(record.rating)}{'☆'.repeat(5 - record.rating)}
                    </Text>
                    {record.note && <Text style={styles.recordNote}>{record.note}</Text>}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 预约记录弹窗 */}
      <Modal
        visible={showAppointmentsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAppointmentsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>预约记录</Text>
              <Pressable onPress={() => setShowAppointmentsModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.recordsList}>
              {appointments.length === 0 ? (
                <View style={styles.emptyRecords}>
                  <Text style={styles.emptyText}>暂无预约记录</Text>
                  <Text style={styles.emptyHint}>去店铺详情页预约理发吧</Text>
                </View>
              ) : (
                appointments.map((appointment) => (
                  <View key={appointment.id} style={styles.appointmentItem}>
                    <View style={styles.appointmentHeader}>
                      <Text style={styles.appointmentShop}>{appointment.shopName}</Text>
                      <View style={[
                        styles.appointmentStatusBadge,
                        appointment.status === 'confirmed' && styles.statusConfirmed,
                        appointment.status === 'pending' && styles.statusPending,
                      ]}>
                        <Text style={styles.appointmentStatusText}>
                          {appointment.status === 'confirmed' ? '已确认' : '待确认'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.appointmentInfo}>
                      <Text style={styles.appointmentDate}>📅 {appointment.date}</Text>
                      <Text style={styles.appointmentTime}>🕐 {appointment.time}</Text>
                    </View>
                    <View style={styles.appointmentActions}>
                      <Pressable 
                        style={styles.cancelAppointmentBtn}
                        onPress={() => cancelAppointment(appointment.id)}
                      >
                        <Text style={styles.cancelAppointmentBtnText}>取消预约</Text>
                      </Pressable>
                      <Pressable style={styles.viewShopBtn}>
                        <Text style={styles.viewShopBtnText}>查看店铺</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  // Modal 样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  modalClose: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 20,
    padding: spacing.sm,
  },
  // 设置样式
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
  },
  settingValue: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.md,
  },
  settingAction: {
    color: colors.accent,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  // 关于我们样式
  aboutContent: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  aboutLogo: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  aboutName: {
    color: '#FFFFFF',
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  aboutVersion: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.sm,
    marginBottom: spacing.xl,
  },
  aboutDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  aboutContact: {
    color: colors.accent,
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  aboutCopyright: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: fontSize.xs,
  },
  // 记录列表样式
  recordsList: {
    maxHeight: 400,
    padding: spacing.lg,
  },
  emptyRecords: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.md,
    marginBottom: spacing.lg,
  },
  addRecordBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  addRecordBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  recordItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
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
  recordDate: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
  },
  recordServices: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  recordRating: {
    color: '#FFB800',
    fontSize: fontSize.md,
    letterSpacing: 2,
  },
  recordNote: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  // 开关样式
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: colors.accent,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  // 预约相关样式
  emptyHint: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  appointmentItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  appointmentShop: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  appointmentStatusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusConfirmed: {
    backgroundColor: 'rgba(74,222,128,0.2)',
  },
  statusPending: {
    backgroundColor: 'rgba(255,183,0,0.2)',
  },
  appointmentStatusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: '#FFB700',
  },
  appointmentInfo: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  appointmentDate: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.sm,
  },
  appointmentTime: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.sm,
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelAppointmentBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  cancelAppointmentBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
  },
  viewShopBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  viewShopBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
});

export default ProfileScreen;
