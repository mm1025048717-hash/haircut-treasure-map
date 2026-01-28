// 理发藏宝图 - 简约深色主题
// 深色背景 + 白色文字 + 橙色点缀

export const colors = {
  // 主色
  primary: '#1A1A2E',
  primaryDark: '#0F0F1A',
  primaryLight: '#252540',

  // 背景
  background: '#0D0D1A',
  surface: '#16162A',
  surfaceLight: '#1E1E35',

  // 点缀色
  accent: '#FF6B35',
  accentLight: '#FF8A5C',
  accentDark: '#E55A2B',

  // 文字 - 优化为更亮的白色
  textPrimary: '#FFFFFF',
  textSecondary: '#E0E0E0',
  textMuted: '#A0A0A0',
  textWhite: '#FFFFFF',

  // 功能色
  success: '#4ADE80',
  warning: '#FBBF24',
  error: '#F87171',

  // 边框
  border: '#2A2A45',
  borderLight: '#3A3A55',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// 服务项目选项
export const serviceOptions = [
  '剪发',
  '洗头',
  '修面',
  '造型',
  '染发',
  '烫发',
];
