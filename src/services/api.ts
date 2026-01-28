import { supabase, isSupabaseConfigured, DbShop, DbBarber, DbHaircutRecord, DbExternalNote, DbFavorite } from '../lib/supabase';
import { Shop, Barber, HaircutRecord, ExternalNote, ShopCategory, Coordinates } from '../types';

// ==========================================
// 数据转换函数
// ==========================================

// 数据库Shop转换为前端Shop
const dbShopToShop = (db: DbShop, isFavorite: boolean = false): Shop => ({
  id: db.id,
  name: db.name,
  address: db.address,
  phone: db.phone || undefined,
  location: {
    latitude: Number(db.latitude),
    longitude: Number(db.longitude),
  },
  category: db.category as ShopCategory,
  avgPrice: db.avg_price,
  priceRange: [db.price_min, db.price_max],
  tags: db.tags || [],
  photos: db.photos || [],
  barberIds: [],
  isFavorite,
});

// 数据库Barber转换为前端Barber
const dbBarberToBarber = (db: DbBarber): Barber => ({
  id: db.id,
  shopId: db.shop_id,
  name: db.name,
  avatar: db.avatar || undefined,
  gender: (db.gender as '男' | '女') || undefined,
  experienceYears: db.experience_years,
  specialties: db.specialties || [],
  rating: Number(db.rating),
  ratingCount: db.rating_count,
  priceRange: db.price_min && db.price_max ? [db.price_min, db.price_max] : undefined,
  isRecommended: db.is_recommended,
  works: [],
});

// 数据库HaircutRecord转换为前端HaircutRecord
const dbRecordToRecord = (db: DbHaircutRecord): HaircutRecord => ({
  id: db.id,
  shopId: db.shop_id,
  date: db.date,
  price: Number(db.price),
  services: db.services || [],
  barberId: db.barber_id || undefined,
  rating: db.rating,
  note: db.note || undefined,
});

// 数据库ExternalNote转换为前端ExternalNote
const dbNoteToNote = (db: DbExternalNote): ExternalNote => ({
  id: db.id,
  shopId: db.shop_id,
  platform: db.platform,
  authorName: db.author_name || '匿名用户',
  authorAvatar: db.author_avatar || undefined,
  content: db.content || '',
  images: db.images || [],
  rating: db.rating ? Number(db.rating) : undefined,
  tags: db.tags || [],
  likes: db.likes,
});

// ==========================================
// API 服务类
// ==========================================
class ApiService {
  private userId: string | null = null;
  private favoriteShopIds: Set<number> = new Set();

  // 初始化：获取当前用户
  async init() {
    if (!isSupabaseConfigured()) {
      console.log('Supabase未配置，使用本地模式');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    this.userId = user?.id || null;

    if (this.userId) {
      await this.loadFavorites();
    }
  }

  // 加载用户收藏
  private async loadFavorites() {
    if (!this.userId) return;

    const { data } = await supabase
      .from('favorites')
      .select('shop_id')
      .eq('user_id', this.userId);

    if (data) {
      this.favoriteShopIds = new Set(data.map(f => f.shop_id));
    }
  }

  // ==========================================
  // 店铺 API
  // ==========================================

  // 获取所有店铺
  async getShops(): Promise<Shop[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取店铺失败:', error);
      return [];
    }

    return (data || []).map(shop => 
      dbShopToShop(shop, this.favoriteShopIds.has(shop.id))
    );
  }

  // 根据ID获取店铺
  async getShopById(id: number): Promise<Shop | null> {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return dbShopToShop(data, this.favoriteShopIds.has(id));
  }

  // 添加店铺
  async addShop(shop: Omit<Shop, 'id' | 'isFavorite' | 'barberIds'>): Promise<Shop | null> {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('shops')
      .insert({
        name: shop.name,
        address: shop.address,
        phone: shop.phone || null,
        latitude: shop.location.latitude,
        longitude: shop.location.longitude,
        category: shop.category,
        avg_price: shop.avgPrice,
        price_min: shop.priceRange[0],
        price_max: shop.priceRange[1],
        tags: shop.tags,
        photos: shop.photos,
        created_by: this.userId,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('添加店铺失败:', error);
      return null;
    }

    return dbShopToShop(data, false);
  }

  // ==========================================
  // 理发师 API
  // ==========================================

  // 获取店铺的理发师
  async getBarbersByShopId(shopId: number): Promise<Barber[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('barbers')
      .select('*')
      .eq('shop_id', shopId)
      .order('is_recommended', { ascending: false });

    if (error) {
      console.error('获取理发师失败:', error);
      return [];
    }

    return (data || []).map(dbBarberToBarber);
  }

  // 获取所有理发师
  async getAllBarbers(): Promise<Barber[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('barbers')
      .select('*')
      .order('rating', { ascending: false });

    if (error) return [];

    return (data || []).map(dbBarberToBarber);
  }

  // ==========================================
  // 理发记录 API
  // ==========================================

  // 获取店铺的理发记录
  async getRecordsByShopId(shopId: number): Promise<HaircutRecord[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('haircut_records')
      .select('*')
      .eq('shop_id', shopId)
      .order('date', { ascending: false });

    if (error) return [];

    return (data || []).map(dbRecordToRecord);
  }

  // 获取用户的所有理发记录
  async getUserRecords(): Promise<HaircutRecord[]> {
    if (!isSupabaseConfigured() || !this.userId) return [];

    const { data, error } = await supabase
      .from('haircut_records')
      .select('*')
      .eq('user_id', this.userId)
      .order('date', { ascending: false });

    if (error) return [];

    return (data || []).map(dbRecordToRecord);
  }

  // 获取所有理发记录
  async getAllRecords(): Promise<HaircutRecord[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('haircut_records')
      .select('*')
      .order('date', { ascending: false });

    if (error) return [];

    return (data || []).map(dbRecordToRecord);
  }

  // 添加理发记录
  async addRecord(record: Omit<HaircutRecord, 'id'>): Promise<HaircutRecord | null> {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('haircut_records')
      .insert({
        shop_id: record.shopId,
        barber_id: record.barberId || null,
        user_id: this.userId,
        date: record.date,
        price: record.price,
        services: record.services,
        rating: record.rating,
        note: record.note || null,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('添加记录失败:', error);
      return null;
    }

    return dbRecordToRecord(data);
  }

  // ==========================================
  // 外部笔记 API
  // ==========================================

  // 获取店铺的外部笔记
  async getNotesByShopId(shopId: number): Promise<ExternalNote[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('external_notes')
      .select('*')
      .eq('shop_id', shopId)
      .order('likes', { ascending: false });

    if (error) return [];

    return (data || []).map(dbNoteToNote);
  }

  // ==========================================
  // 收藏 API
  // ==========================================

  // 切换收藏状态
  async toggleFavorite(shopId: number): Promise<boolean> {
    if (!isSupabaseConfigured() || !this.userId) {
      // 本地模式：直接切换内存中的状态
      if (this.favoriteShopIds.has(shopId)) {
        this.favoriteShopIds.delete(shopId);
        return false;
      } else {
        this.favoriteShopIds.add(shopId);
        return true;
      }
    }

    const isFavorite = this.favoriteShopIds.has(shopId);

    if (isFavorite) {
      // 取消收藏
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', this.userId)
        .eq('shop_id', shopId);

      if (!error) {
        this.favoriteShopIds.delete(shopId);
        return false;
      }
    } else {
      // 添加收藏
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: this.userId,
          shop_id: shopId,
        });

      if (!error) {
        this.favoriteShopIds.add(shopId);
        return true;
      }
    }

    return isFavorite;
  }

  // 检查是否收藏
  isFavorite(shopId: number): boolean {
    return this.favoriteShopIds.has(shopId);
  }

  // 获取收藏的店铺ID列表
  getFavoriteShopIds(): number[] {
    return Array.from(this.favoriteShopIds);
  }

  // ==========================================
  // 认证 API
  // ==========================================

  // 匿名登录
  async signInAnonymously(): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      console.error('匿名登录失败:', error);
      return false;
    }

    this.userId = data.user?.id || null;
    return !!this.userId;
  }

  // 登出
  async signOut(): Promise<void> {
    if (!isSupabaseConfigured()) return;

    await supabase.auth.signOut();
    this.userId = null;
    this.favoriteShopIds.clear();
  }

  // 获取当前用户ID
  getUserId(): string | null {
    return this.userId;
  }

  // 是否已登录
  isLoggedIn(): boolean {
    return !!this.userId;
  }
}

// 导出单例
export const api = new ApiService();
