import React, { useState } from 'react';
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
  Image,
} from 'react-native';
import { colors, borderRadius, fontSize, fontWeight, spacing } from '../theme';
import { useStore, shopCategoryConfig } from '../store';
import { ShopCategory } from '../types';

// Web 友好的 Alert
const showAlert = (title: string, message: string, onOk?: () => void) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
    onOk?.();
  } else {
    const { Alert } = require('react-native');
    Alert.alert(title, message, [{ text: '好的', onPress: onOk }]);
  }
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

// 示例可选照片
const samplePhotoOptions = [
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=300&fit=crop',
];

const categoryOptions: { value: ShopCategory; label: string; icon: string }[] = [
  { value: 'community', label: '社区老店', icon: '🏠' },
  { value: 'mall', label: '商场店', icon: '🏬' },
  { value: 'chain', label: '连锁品牌', icon: '🔗' },
  { value: 'studio', label: '独立工作室', icon: '✨' },
];

const AddShopModal: React.FC<Props> = ({ visible, onClose, onSuccess }) => {
  const store = useStore();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<ShopCategory>('community');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const resetForm = () => {
    setName('');
    setAddress('');
    setPhone('');
    setCategory('community');
    setMinPrice('');
    setMaxPrice('');
    setSelectedPhotos([]);
  };

  const togglePhoto = (photo: string) => {
    setSelectedPhotos((prev) =>
      prev.includes(photo)
        ? prev.filter((p) => p !== photo)
        : [...prev, photo]
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      showAlert('提示', '请输入店铺名称');
      return;
    }
    if (!address.trim()) {
      showAlert('提示', '请输入店铺地址');
      return;
    }

    const min = parseInt(minPrice) || 20;
    const max = parseInt(maxPrice) || 50;

    store.addShop({
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim() || undefined,
      category,
      location: {
        // 随机生成北京附近的坐标
        latitude: 39.9 + (Math.random() - 0.5) * 0.1,
        longitude: 116.4 + (Math.random() - 0.5) * 0.1,
      },
      priceRange: [min, max],
      avgPrice: Math.round((min + max) / 2),
      photos: selectedPhotos.length > 0 ? selectedPhotos : [samplePhotoOptions[0]],
      tags: [],
      createdAt: new Date().toISOString(),
    });

    showAlert('成功', '店铺添加成功！', () => {
      resetForm();
      onClose();
      onSuccess?.();
    });
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
            <Text style={styles.title}>添加新店铺</Text>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.field}>
              <Text style={styles.label}>店铺名称 *</Text>
              <TextInput
                style={styles.input}
                placeholder="输入店铺名称"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>店铺地址 *</Text>
              <TextInput
                style={styles.input}
                placeholder="输入详细地址"
                placeholderTextColor={colors.textMuted}
                value={address}
                onChangeText={setAddress}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>店铺类型</Text>
              <View style={styles.categoryGrid}>
                {categoryOptions.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.categoryChip,
                      category === opt.value && styles.categoryChipActive,
                    ]}
                    onPress={() => setCategory(opt.value)}
                  >
                    <Text style={styles.categoryIcon}>{opt.icon}</Text>
                    <Text
                      style={[
                        styles.categoryText,
                        category === opt.value && styles.categoryTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>联系电话</Text>
              <TextInput
                style={styles.input}
                placeholder="输入电话（选填）"
                placeholderTextColor={colors.textMuted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>价格区间</Text>
              <View style={styles.priceRow}>
                <TextInput
                  style={[styles.input, styles.priceInput]}
                  placeholder="最低价"
                  placeholderTextColor={colors.textMuted}
                  value={minPrice}
                  onChangeText={setMinPrice}
                  keyboardType="number-pad"
                />
                <Text style={styles.priceDivider}>-</Text>
                <TextInput
                  style={[styles.input, styles.priceInput]}
                  placeholder="最高价"
                  placeholderTextColor={colors.textMuted}
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  keyboardType="number-pad"
                />
                <Text style={styles.priceUnit}>元</Text>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>店铺照片</Text>
              <Text style={styles.photoHint}>选择照片来展示你的店铺（可多选）</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.photoScroll}
              >
                {samplePhotoOptions.map((photo, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.photoOption,
                      selectedPhotos.includes(photo) && styles.photoOptionSelected,
                    ]}
                    onPress={() => togglePhoto(photo)}
                  >
                    <Image source={{ uri: photo }} style={styles.photoImage} />
                    {selectedPhotos.includes(photo) && (
                      <View style={styles.photoCheckmark}>
                        <Text style={styles.photoCheckmarkText}>✓</Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </ScrollView>
              {selectedPhotos.length > 0 && (
                <Text style={styles.selectedCount}>
                  已选择 {selectedPhotos.length} 张照片
                </Text>
              )}
            </View>

            <View style={styles.tip}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>
                添加店铺后可以在地图上看到标记，方便下次找到
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelBtnText}>取消</Text>
            </Pressable>
            <Pressable style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>添加店铺</Text>
            </Pressable>
          </View>
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
    maxHeight: '85%',
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
  content: {
    padding: spacing.lg,
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: 'rgba(255,107,53,0.15)',
    borderColor: colors.accent,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
  },
  categoryTextActive: {
    color: colors.accent,
    fontWeight: fontWeight.medium,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
  },
  priceDivider: {
    color: 'rgba(255,255,255,0.5)',
    marginHorizontal: spacing.md,
    fontSize: fontSize.lg,
  },
  priceUnit: {
    color: 'rgba(255,255,255,0.7)',
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
  },
  photoHint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  photoScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  photoOption: {
    width: 100,
    height: 75,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  photoOptionSelected: {
    borderColor: colors.accent,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoCheckmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoCheckmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: fontWeight.bold,
  },
  selectedCount: {
    color: colors.accent,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  tip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,107,53,0.1)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  tipIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  tipText: {
    flex: 1,
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.sm,
    lineHeight: 22,
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

export default AddShopModal;
