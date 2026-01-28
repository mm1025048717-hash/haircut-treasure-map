import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, borderRadius, fontSize, fontWeight, spacing, serviceOptions } from '../theme';
import { useStore, mockWechatPayRecords, WechatPayRecord } from '../store';
import { Shop } from '../types';

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
      } else if (!confirmed && buttons[0]?.onPress) {
        buttons[0].onPress();
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

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preSelectedShopId?: number; // 从店铺详情页进入时预选的店铺
};

const AddRecordModal: React.FC<Props> = ({
  visible,
  onClose,
  onSuccess,
  preSelectedShopId,
}) => {
  const store = useStore();
  const shops = store.getShops();

  const [mode, setMode] = useState<'manual' | 'wechat'>('manual');
  const [selectedShopId, setSelectedShopId] = useState<number | null>(
    preSelectedShopId || null
  );
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [price, setPrice] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>(['剪发']);
  const [rating, setRating] = useState(5);
  const [note, setNote] = useState('');

  // 重置表单
  const resetForm = () => {
    setMode('manual');
    setSelectedShopId(preSelectedShopId || null);
    setDate(new Date().toISOString().split('T')[0]);
    setPrice('');
    setSelectedServices(['剪发']);
    setRating(5);
    setNote('');
  };

  // 切换服务选择
  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  // 从微信支付记录导入
  const importFromWechat = (record: WechatPayRecord) => {
    // 查找匹配的店铺
    const matchedShop = store.findShopByMerchantName(record.merchantName);

    if (matchedShop) {
      setSelectedShopId(matchedShop.id);
    } else {
      // 没有匹配的店铺，提示用户先添加
      showAlert(
        '未找到店铺',
        `"${record.merchantName}" 不在您的店铺列表中，是否先添加？`,
        [
          { text: '取消', style: 'cancel' },
          {
            text: '手动选择',
            onPress: () => setMode('manual'),
          },
        ]
      );
      return;
    }

    setDate(record.date);
    setPrice(record.amount.toString());
    setMode('manual');
    showAlert('导入成功', '已导入支付信息，请补充其他信息');
  };

  // 提交
  const handleSubmit = () => {
    if (!selectedShopId) {
      showAlert('提示', '请选择理发店铺');
      return;
    }
    if (!price || parseInt(price) <= 0) {
      showAlert('提示', '请输入有效的消费金额');
      return;
    }
    if (selectedServices.length === 0) {
      showAlert('提示', '请至少选择一项服务');
      return;
    }

    store.addRecord({
      shopId: selectedShopId,
      date,
      price: parseInt(price),
      services: selectedServices,
      rating,
      note: note.trim() || undefined,
    });

    showAlert('成功', '理发记录已添加！', [
      {
        text: '好的',
        onPress: () => {
          resetForm();
          onClose();
          onSuccess?.();
        },
      },
    ]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>添加理发记录</Text>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* 模式切换 */}
          <View style={styles.modeSwitch}>
            <Pressable
              style={[styles.modeBtn, mode === 'manual' && styles.modeBtnActive]}
              onPress={() => setMode('manual')}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  mode === 'manual' && styles.modeBtnTextActive,
                ]}
              >
                ✏️ 手动填写
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeBtn, mode === 'wechat' && styles.modeBtnActive]}
              onPress={() => setMode('wechat')}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  mode === 'wechat' && styles.modeBtnTextActive,
                ]}
              >
                💳 微信账单导入
              </Text>
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {mode === 'wechat' ? (
              // 微信支付记录列表
              <View>
                <Text style={styles.sectionTitle}>最近的理发相关支付</Text>
                <Text style={styles.sectionHint}>点击下方记录快速导入</Text>
                {mockWechatPayRecords.map((record) => (
                  <Pressable
                    key={record.id}
                    style={styles.wechatCard}
                    onPress={() => importFromWechat(record)}
                  >
                    <View style={styles.wechatInfo}>
                      <Text style={styles.wechatMerchant}>{record.merchantName}</Text>
                      <Text style={styles.wechatDate}>{record.date}</Text>
                    </View>
                    <Text style={styles.wechatAmount}>-¥{record.amount}</Text>
                  </Pressable>
                ))}
                <View style={styles.wechatTip}>
                  <Text style={styles.wechatTipText}>
                    💡 实际使用中可对接微信支付API获取真实账单
                  </Text>
                </View>
              </View>
            ) : (
              // 手动填写表单
              <View>
                {/* 选择店铺 */}
                <View style={styles.field}>
                  <Text style={styles.label}>选择店铺 *</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.shopList}
                  >
                    {shops.map((shop) => (
                      <Pressable
                        key={shop.id}
                        style={[
                          styles.shopChip,
                          selectedShopId === shop.id && styles.shopChipActive,
                        ]}
                        onPress={() => setSelectedShopId(shop.id)}
                      >
                        <Text
                          style={[
                            styles.shopChipText,
                            selectedShopId === shop.id && styles.shopChipTextActive,
                          ]}
                        >
                          {shop.name}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                {/* 日期 */}
                <View style={styles.field}>
                  <Text style={styles.label}>理发日期</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textMuted}
                    value={date}
                    onChangeText={setDate}
                  />
                </View>

                {/* 金额 */}
                <View style={styles.field}>
                  <Text style={styles.label}>消费金额 *</Text>
                  <View style={styles.priceInputRow}>
                    <Text style={styles.pricePrefix}>¥</Text>
                    <TextInput
                      style={[styles.input, styles.priceInputField]}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                {/* 服务项目 */}
                <View style={styles.field}>
                  <Text style={styles.label}>服务项目</Text>
                  <View style={styles.serviceGrid}>
                    {serviceOptions.map((service) => (
                      <Pressable
                        key={service}
                        style={[
                          styles.serviceChip,
                          selectedServices.includes(service) &&
                            styles.serviceChipActive,
                        ]}
                        onPress={() => toggleService(service)}
                      >
                        <Text
                          style={[
                            styles.serviceChipText,
                            selectedServices.includes(service) &&
                              styles.serviceChipTextActive,
                          ]}
                        >
                          {service}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* 评分 */}
                <View style={styles.field}>
                  <Text style={styles.label}>满意度评分</Text>
                  <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Pressable key={star} onPress={() => setRating(star)}>
                        <Text
                          style={[
                            styles.ratingStar,
                            star <= rating && styles.ratingStarActive,
                          ]}
                        >
                          {star <= rating ? '★' : '☆'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* 备注 */}
                <View style={styles.field}>
                  <Text style={styles.label}>备注（选填）</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="记录一下这次理发的体验..."
                    placeholderTextColor={colors.textMuted}
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            )}
          </ScrollView>

          {mode === 'manual' && (
            <View style={styles.footer}>
              <Pressable style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelBtnText}>取消</Text>
              </Pressable>
              <Pressable style={styles.submitBtn} onPress={handleSubmit}>
                <Text style={styles.submitBtnText}>保存记录</Text>
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  closeBtn: {
    padding: spacing.sm,
  },
  closeBtnText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.xl,
  },
  modeSwitch: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modeBtnActive: {
    backgroundColor: 'rgba(255,107,53,0.15)',
    borderColor: colors.accent,
  },
  modeBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  modeBtnTextActive: {
    color: colors.accent,
  },
  content: {
    padding: spacing.lg,
    maxHeight: 420,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  sectionHint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  wechatCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  wechatInfo: {
    flex: 1,
  },
  wechatMerchant: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  wechatDate: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.sm,
    marginTop: 4,
  },
  wechatAmount: {
    color: colors.accent,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  wechatTip: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: borderRadius.md,
  },
  wechatTipText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    color: '#FFFFFF',
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textArea: {
    minHeight: 80,
    paddingTop: spacing.md,
  },
  shopList: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  shopChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  shopChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  shopChipText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
  },
  shopChipTextActive: {
    color: '#FFFFFF',
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pricePrefix: {
    color: colors.accent,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginRight: spacing.sm,
  },
  priceInputField: {
    flex: 1,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  serviceChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  serviceChipActive: {
    backgroundColor: 'rgba(255,107,53,0.15)',
    borderColor: colors.accent,
  },
  serviceChipText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
  },
  serviceChipTextActive: {
    color: colors.accent,
    fontWeight: fontWeight.medium,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  ratingStar: {
    fontSize: 36,
    color: 'rgba(255,255,255,0.2)',
  },
  ratingStarActive: {
    color: colors.warning,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cancelBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  submitBtn: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: colors.accent,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});

export default AddRecordModal;
