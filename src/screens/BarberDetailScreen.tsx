import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useStore } from '../store';
import { ExternalNote, HaircutRecord } from '../types';
import {
  colors,
  borderRadius,
  fontSize,
  fontWeight,
  spacing,
} from '../theme';
import AddRecordModal from '../components/AddRecordModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WORK_SIZE = (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm * 2) / 3;

// Web 友好的 Alert
const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    const { Alert } = require('react-native');
    Alert.alert(title, message);
  }
};

type BarberDetailRouteProp = RouteProp<RootStackParamList, 'BarberDetail'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

type BarberDetailProps = {
  route: BarberDetailRouteProp;
};

const BarberDetailScreen: React.FC<BarberDetailProps> = ({ route }) => {
  const { barberId } = route.params;
  const navigation = useNavigation<NavigationProp>();
  const store = useStore();
  const barber = store.getBarberById(barberId);
  const shop = barber ? store.getShopById(barber.shopId) : null;
  const notes = store.getNotesByBarberId(barberId);
  const records = store.getRecordsByBarberId(barberId);

  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'works' | 'notes' | 'records'>('works');

  if (!barber || !shop) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>理发师不存在</Text>
      </View>
    );
  }

  const handleAddRecord = () => {
    setShowAddRecordModal(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 头部信息 */}
      <View style={styles.header}>
        <Image source={{ uri: barber.avatar }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{barber.name}</Text>
            {barber.isRecommended && (
              <View style={styles.recommendBadge}>
                <Text style={styles.recommendBadgeText}>推荐</Text>
              </View>
            )}
          </View>
          <Text style={styles.meta}>
            {barber.gender === 'male' ? '男' : '女'} · {barber.age}岁 · {barber.yearsOfExperience}年经验
          </Text>
          <Pressable onPress={() => navigation.navigate('ShopDetail', { shopId: shop.id })}>
            <Text style={styles.shopLink}>📍 {shop.name}</Text>
          </Pressable>
        </View>
      </View>

      {/* 评分和价格 */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>⭐ {barber.rating}</Text>
          <Text style={styles.statLabel}>{barber.ratingCount}条评价</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>¥{barber.priceRange[0]}-{barber.priceRange[1]}</Text>
          <Text style={styles.statLabel}>价格区间</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{barber.works.length}</Text>
          <Text style={styles.statLabel}>作品</Text>
        </View>
      </View>

      {/* 擅长领域 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>擅长领域</Text>
        <View style={styles.specialtiesGrid}>
          {barber.specialties.map((specialty, index) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 简介 */}
      {barber.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>理发师简介</Text>
          <Text style={styles.description}>{barber.description}</Text>
        </View>
      )}

      {/* 选TA理发按钮 */}
      <Pressable style={styles.bookButton} onPress={handleAddRecord}>
        <Text style={styles.bookButtonText}>✂️ 记录在TA这理发</Text>
      </Pressable>

      {/* Tab 切换 */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === 'works' && styles.tabActive]}
          onPress={() => setActiveTab('works')}
        >
          <Text style={[styles.tabText, activeTab === 'works' && styles.tabTextActive]}>
            作品集 ({barber.works.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'notes' && styles.tabActive]}
          onPress={() => setActiveTab('notes')}
        >
          <Text style={[styles.tabText, activeTab === 'notes' && styles.tabTextActive]}>
            相关笔记 ({notes.length})
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
        {activeTab === 'works' && (
          <View>
            {barber.works.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📷</Text>
                <Text style={styles.emptyText}>暂无作品</Text>
              </View>
            ) : (
              <View style={styles.worksGrid}>
                {barber.works.map((work) => (
                  <Pressable key={work.id} style={styles.workItem}>
                    <Image source={{ uri: work.imageUrl }} style={styles.workImage} />
                    <View style={styles.workOverlay}>
                      <Text style={styles.workTitle} numberOfLines={1}>{work.title}</Text>
                      <Text style={styles.workStyle}>{work.style}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'notes' && (
          <View>
            {notes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyText}>暂无相关笔记</Text>
                <Text style={styles.emptyHint}>小红书和大众点评的相关内容将在此展示</Text>
              </View>
            ) : (
              notes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))
            )}
          </View>
        )}

        {activeTab === 'records' && (
          <View>
            {records.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>✂️</Text>
                <Text style={styles.emptyText}>你还没有在TA这理过发</Text>
                <Pressable style={styles.emptyAddBtn} onPress={handleAddRecord}>
                  <Text style={styles.emptyAddBtnText}>添加记录</Text>
                </Pressable>
              </View>
            ) : (
              records.map((record) => (
                <RecordCard key={record.id} record={record} />
              ))
            )}
          </View>
        )}
      </View>

      {/* 理发师选择建议 */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>💡 选理发师小贴士</Text>
        <View style={styles.tipsList}>
          {barber.gender === 'female' ? (
            <Text style={styles.tipItem}>• 女理发师通常更懂女生的需求和审美</Text>
          ) : barber.age >= 30 ? (
            <Text style={styles.tipItem}>• 30岁以上的男理发师，技术有沉淀，审美不会太老</Text>
          ) : (
            <Text style={styles.tipItem}>• 年轻理发师审美更时尚，适合追求潮流的你</Text>
          )}
          <Text style={styles.tipItem}>• 找到满意的理发师后建议长期合作，磨合后效果更好</Text>
          <Text style={styles.tipItem}>• 好的发型无关价格，社区店也能剪出好效果</Text>
        </View>
      </View>

      {/* 底部留白 */}
      <View style={{ height: 40 }} />

      {/* 添加记录弹窗 */}
      <AddRecordModal
        visible={showAddRecordModal}
        onClose={() => setShowAddRecordModal(false)}
        preSelectedShopId={shop.id}
      />
    </ScrollView>
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
const RecordCard: React.FC<{ record: HaircutRecord }> = ({ record }) => {
  return (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <Text style={styles.recordDate}>
          {new Date(record.date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
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
    paddingBottom: spacing.xxl,
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
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: spacing.lg,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  recommendBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: spacing.sm,
  },
  recommendBadgeText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  shopLink: {
    color: colors.accent,
    fontSize: fontSize.sm,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
    padding: spacing.lg,
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
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  section: {
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
    padding: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  specialtiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  specialtyTag: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  specialtyText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 24,
  },
  bookButton: {
    backgroundColor: colors.accent,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
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
    color: colors.textMuted,
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
    color: colors.textSecondary,
    fontSize: fontSize.lg,
  },
  emptyHint: {
    color: colors.textMuted,
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
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },

  // 作品网格
  worksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  workItem: {
    width: WORK_SIZE,
    height: WORK_SIZE,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  workImage: {
    width: '100%',
    height: '100%',
  },
  workOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: spacing.xs,
  },
  workTitle: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  workStyle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
  },

  // 笔记卡片
  noteCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  noteAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: spacing.sm,
  },
  noteAuthorInfo: {
    flex: 1,
  },
  noteAuthorName: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  platformBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  platformBadgeText: {
    color: '#fff',
    fontSize: 10,
  },
  noteContent: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  noteImages: {
    marginBottom: spacing.sm,
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
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
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },

  // 理发记录卡片
  recordCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  recordDate: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  recordPrice: {
    color: colors.accent,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  recordServices: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  recordRating: {
    marginBottom: spacing.sm,
  },
  ratingStars: {
    color: colors.warning,
    fontSize: fontSize.md,
  },
  recordNote: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },

  // 理发师选择建议
  tipsSection: {
    backgroundColor: colors.surfaceLight,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  tipsTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  tipsList: {
    gap: spacing.sm,
  },
  tipItem: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
});

export default BarberDetailScreen;
