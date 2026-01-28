import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ==========================================
// Supabase 配置
// ==========================================
// 请在Supabase控制台获取以下信息：
// Settings > API > Project URL 和 anon public key

const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // 例如: https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // 例如: eyJhbGciOiJIUzI1NiIs...

// 检查是否已配置
export const isSupabaseConfigured = () => {
  return (
    SUPABASE_URL !== 'YOUR_SUPABASE_URL' &&
    SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY'
  );
};

// 创建Supabase客户端
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // 使用AsyncStorage存储认证信息（React Native）
    storage: Platform.OS !== 'web' ? AsyncStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// ==========================================
// 数据库类型定义
// ==========================================
export interface DbShop {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  category: string;
  avg_price: number;
  price_min: number;
  price_max: number;
  tags: string[];
  photos: string[];
  created_by: string | null;
  created_at: string;
}

export interface DbBarber {
  id: number;
  shop_id: number;
  name: string;
  avatar: string | null;
  gender: string | null;
  experience_years: number;
  specialties: string[];
  rating: number;
  rating_count: number;
  price_min: number | null;
  price_max: number | null;
  is_recommended: boolean;
  created_at: string;
}

export interface DbHaircutRecord {
  id: number;
  shop_id: number;
  barber_id: number | null;
  user_id: string | null;
  date: string;
  price: number;
  services: string[];
  rating: number;
  note: string | null;
  photos: string[];
  created_at: string;
}

export interface DbExternalNote {
  id: number;
  shop_id: number;
  platform: 'xiaohongshu' | 'dianping';
  author_name: string | null;
  author_avatar: string | null;
  content: string | null;
  images: string[];
  rating: number | null;
  tags: string[];
  likes: number;
  external_url: string | null;
  created_at: string;
}

export interface DbFavorite {
  id: number;
  user_id: string;
  shop_id: number;
  created_at: string;
}

export interface DbProfile {
  id: string;
  nickname: string | null;
  avatar: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}
