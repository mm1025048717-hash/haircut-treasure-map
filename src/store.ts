// 理发地图 - 状态管理
// 支持本地模式和Supabase云端模式
import { Shop, HaircutRecord, Barber, BarberWork, ExternalNote, ShopCategory } from './types';
import { api } from './services/api';
import { isSupabaseConfigured } from './lib/supabase';

// 示例图片URL
const avatars = {
  male1: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  male2: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
  male3: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
  female1: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  female2: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
};

const shopPhotos = {
  community: [
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop',
  ],
  mall: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=300&fit=crop',
  ],
  studio: [
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=300&fit=crop',
  ],
};

const workPhotos = [
  'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1620331311520-246422fd82f9?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1596362601603-8c2ed4f8c6b4?w=400&h=400&fit=crop',
];

// 店铺类型配置（极简设计，无emoji图标）
export const shopCategoryConfig: Record<ShopCategory, { label: string; color: string }> = {
  community: { label: '社区店', color: '#10B981' },
  mall: { label: '商场店', color: '#8B5CF6' },
  chain: { label: '连锁店', color: '#F59E0B' },
  studio: { label: '工作室', color: '#EC4899' },
};

// 初始店铺数据
const initialShops: Shop[] = [
  {
    id: 1,
    name: '长安路老理发',
    location: { latitude: 39.9087, longitude: 116.3975 },
    address: '西城区长安路12号（社区底商）',
    phone: '010-12345678',
    category: 'community',
    priceRange: [20, 35],
    avgPrice: 28,
    isFavorite: true,
    photos: shopPhotos.community,
    tags: ['老年人信赖', '手艺精湛', '20年老店', '修面专业'],
    barberIds: [1, 2],
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: '胡同手艺社',
    location: { latitude: 39.9142, longitude: 116.4041 },
    address: '东城区南锣鼓巷28号',
    category: 'community',
    priceRange: [25, 40],
    avgPrice: 32,
    isFavorite: false,
    photos: shopPhotos.community,
    tags: ['胡同文化', '老北京风情', '性价比高'],
    barberIds: [3],
    createdAt: '2024-02-20T14:30:00Z',
  },
  {
    id: 3,
    name: 'MODA造型（国贸店）',
    location: { latitude: 39.8995, longitude: 116.3891 },
    address: '朝阳区国贸商城B1层',
    phone: '010-87654321',
    category: 'mall',
    priceRange: [298, 598],
    avgPrice: 398,
    isFavorite: true,
    photos: shopPhotos.mall,
    tags: ['时尚造型', '日韩风格', '染烫专业', '网红打卡'],
    barberIds: [4, 5],
    createdAt: '2024-01-08T09:00:00Z',
  },
  {
    id: 4,
    name: '木北造型（连锁）',
    location: { latitude: 39.9229, longitude: 116.3922 },
    address: '海淀区中关村大街58号',
    phone: '400-123-4567',
    category: 'chain',
    priceRange: [68, 168],
    avgPrice: 98,
    isFavorite: false,
    photos: shopPhotos.mall,
    tags: ['连锁品牌', '标准化服务', '会员优惠'],
    barberIds: [6, 7],
    createdAt: '2024-03-01T11:00:00Z',
  },
  {
    id: 5,
    name: 'Elle私人定制工作室',
    location: { latitude: 39.9315, longitude: 116.4172 },
    address: '朝阳区三里屯SOHO 5号楼2306',
    phone: '138-0000-1234',
    category: 'studio',
    priceRange: [388, 888],
    avgPrice: 588,
    isFavorite: false,
    photos: shopPhotos.studio,
    tags: ['私人订制', '一对一服务', '高端体验', '预约制'],
    barberIds: [8],
    createdAt: '2024-02-10T16:00:00Z',
  },
];

// 理发师数据
const initialBarbers: Barber[] = [
  {
    id: 1,
    shopId: 1,
    name: '张师傅',
    avatar: avatars.male3,
    gender: 'male',
    age: 52,
    yearsOfExperience: 30,
    specialties: ['日常修剪', '修面', '老式理发'],
    priceRange: [20, 30],
    rating: 4.9,
    ratingCount: 328,
    isRecommended: true,
    description: '30年老手艺，小区里的老人孩子都找他剪。修面用的老式剃刀，手法稳当。',
    works: [],
  },
  {
    id: 2,
    shopId: 1,
    name: '李姐',
    avatar: avatars.female2,
    gender: 'female',
    age: 45,
    yearsOfExperience: 20,
    specialties: ['女士短发', '烫发', '日常打理'],
    priceRange: [25, 35],
    rating: 4.7,
    ratingCount: 156,
    isRecommended: true,
    description: '擅长中老年女士发型，烫发手艺好，很多阿姨专门来找她。',
    works: [],
  },
  {
    id: 3,
    shopId: 2,
    name: '老王',
    avatar: avatars.male2,
    gender: 'male',
    age: 48,
    yearsOfExperience: 25,
    specialties: ['板寸', '平头', '儿童理发'],
    priceRange: [20, 30],
    rating: 4.6,
    ratingCount: 89,
    isRecommended: false,
    description: '胡同里开了15年了，周围邻居都熟，价格实惠。',
    works: [],
  },
  {
    id: 4,
    shopId: 3,
    name: 'Kevin',
    avatar: avatars.male1,
    gender: 'male',
    age: 32,
    yearsOfExperience: 10,
    specialties: ['时尚造型', '日韩风格', '染发', '烫发'],
    priceRange: [298, 498],
    rating: 4.8,
    ratingCount: 567,
    isRecommended: true,
    description: '日本进修归来，擅长日韩系造型。审美在线，沟通顺畅，不会强推办卡。',
    works: [],
  },
  {
    id: 5,
    shopId: 3,
    name: 'Yuki',
    avatar: avatars.female1,
    gender: 'female',
    age: 28,
    yearsOfExperience: 6,
    specialties: ['女士造型', '挑染', '层次剪裁'],
    priceRange: [358, 598],
    rating: 4.9,
    ratingCount: 423,
    isRecommended: true,
    description: '年轻女理发师，审美很好，特别懂女生想要什么。作品集很惊艳。',
    works: [],
  },
  {
    id: 6,
    shopId: 4,
    name: '小陈',
    avatar: avatars.male1,
    gender: 'male',
    age: 26,
    yearsOfExperience: 4,
    specialties: ['男士短发', '渐变', '油头'],
    priceRange: [68, 128],
    rating: 4.3,
    ratingCount: 234,
    isRecommended: false,
    description: '连锁店新晋发型师，手法还行，就是有时候会推销产品。',
    works: [],
  },
  {
    id: 7,
    shopId: 4,
    name: '阿杰',
    avatar: avatars.male2,
    gender: 'male',
    age: 35,
    yearsOfExperience: 12,
    specialties: ['男女通剪', '烫染', '护理'],
    priceRange: [98, 168],
    rating: 4.5,
    ratingCount: 412,
    isRecommended: true,
    description: '店里资深发型师，技术稳定，不会翻车。',
    works: [],
  },
  {
    id: 8,
    shopId: 5,
    name: 'Elle',
    avatar: avatars.female1,
    gender: 'female',
    age: 34,
    yearsOfExperience: 12,
    specialties: ['高端造型', '色彩设计', '形象顾问'],
    priceRange: [388, 888],
    rating: 4.9,
    ratingCount: 189,
    isRecommended: true,
    description: '工作室主理人，曾在时装周后台工作，擅长根据脸型气质设计发型。纯预约制，服务细致。',
    works: [],
  },
];

// 为每个理发师生成作品
initialBarbers.forEach((barber) => {
  const workCount = barber.rating > 4.7 ? 4 : 2;
  for (let i = 0; i < workCount; i++) {
    barber.works.push({
      id: barber.id * 100 + i,
      barberId: barber.id,
      imageUrl: workPhotos[i % workPhotos.length],
      title: ['清爽短发', '日系造型', '复古油头', '层次剪裁', '自然卷烫', '挑染设计'][i % 6],
      style: ['日常', '时尚', '复古', '日韩', '欧美'][i % 5],
      gender: i % 2 === 0 ? 'male' : 'female',
      createdAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
});

// 模拟外部平台笔记
const initialExternalNotes: ExternalNote[] = [
  {
    id: 'xhs001',
    shopId: 1,
    barberId: 1,
    platform: 'xiaohongshu',
    authorName: '北漂小王',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    content: '终于找到一家靠谱的社区理发店！张师傅手艺真的绝了，28块钱剪完比我之前花300的还满意。修面用的老式剃刀，第一次体验，太舒服了！关键是不推销不办卡，以后就认准这家了。',
    images: [workPhotos[0], workPhotos[1]],
    likes: 2341,
    tags: ['理发探店', '北京理发', '性价比', '社区理发'],
    createdAt: '2024-03-10T10:00:00Z',
  },
  {
    id: 'xhs002',
    shopId: 3,
    barberId: 5,
    platform: 'xiaohongshu',
    authorName: '时髦精Luna',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    content: 'Yuki老师太懂我了！之前去别的店剪层次总是翻车，这次终于成功了。虽然价格不便宜，但真的值！而且她不会强推办卡，全程沟通很顺畅，下次染发还找她。',
    images: [workPhotos[2], workPhotos[3]],
    likes: 5678,
    tags: ['发型设计', '国贸探店', '女生发型', '层次剪裁'],
    createdAt: '2024-03-15T14:00:00Z',
  },
  {
    id: 'dp001',
    shopId: 1,
    platform: 'dianping',
    authorName: '李大爷',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    content: '在这剪了十几年了，张师傅手艺没得说。我们老年人就喜欢这种实在的店，不花里胡哨，价格公道，剪得又好。',
    images: [],
    likes: 45,
    rating: 5,
    tags: ['老字号', '性价比高'],
    createdAt: '2024-02-20T09:00:00Z',
  },
  {
    id: 'dp002',
    shopId: 3,
    platform: 'dianping',
    authorName: '职场新人小美',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    content: '第一次来MODA，朋友推荐的Kevin老师。确实专业，会根据脸型推荐适合的发型。价格中等偏上，但效果确实好，剪完同事都说变好看了。唯一缺点是要提前预约。',
    images: [workPhotos[4]],
    likes: 128,
    rating: 4,
    tags: ['服务好', '环境不错', '需预约'],
    createdAt: '2024-03-08T16:00:00Z',
  },
  {
    id: 'xhs003',
    shopId: 5,
    barberId: 8,
    platform: 'xiaohongshu',
    authorName: '艺术生Coco',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    content: 'Elle老师真的是我遇过最专业的发型师！第一次咨询就聊了半小时，分析我的脸型、发质、日常风格。虽然价格确实贵，但这种一对一的服务体验真的值。而且她家环境超级好，很私密，不会有那种嘈杂的理发店氛围。',
    images: [workPhotos[5], workPhotos[0]],
    likes: 3456,
    tags: ['高端理发', '私人订制', '形象设计', '三里屯'],
    createdAt: '2024-03-18T11:00:00Z',
  },
  {
    id: 'xhs004',
    shopId: 4,
    barberId: 7,
    platform: 'xiaohongshu',
    authorName: '打工人小张',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    content: '木北造型中规中矩吧，找阿杰剪的，技术还行，98块的套餐包含洗剪吹。就是会推销办卡，我都拒绝了。如果不想踩雷又不想花太多钱，连锁店至少不会太差。',
    images: [workPhotos[1]],
    likes: 892,
    tags: ['连锁理发', '中关村', '性价比'],
    createdAt: '2024-03-12T15:00:00Z',
  },
];

// 初始理发记录
const initialRecords: HaircutRecord[] = [
  {
    id: 1,
    shopId: 1,
    barberId: 1,
    date: '2024-03-15',
    price: 28,
    services: ['剪发', '修面'],
    rating: 5,
    note: '张师傅手艺很好，修面用的老式剃刀，很舒服。以后就认准他了。',
    createdAt: '2024-03-15T10:30:00Z',
  },
  {
    id: 2,
    shopId: 3,
    barberId: 4,
    date: '2024-03-18',
    price: 398,
    services: ['剪发', '造型'],
    rating: 5,
    note: 'Kevin确实专业，日韩风格做得很好。贵是贵了点，但效果确实不一样。',
    createdAt: '2024-03-18T16:00:00Z',
  },
  {
    id: 3,
    shopId: 1,
    barberId: 1,
    date: '2024-02-28',
    price: 25,
    services: ['剪发'],
    rating: 5,
    note: '快过年了来剪个头，张师傅说给我剪精神点。果然没让我失望。',
    createdAt: '2024-02-28T14:00:00Z',
  },
  {
    id: 4,
    shopId: 4,
    barberId: 7,
    date: '2024-02-15',
    price: 98,
    services: ['剪发', '洗护'],
    rating: 4,
    note: '阿杰技术还行，就是推销办卡有点烦。下次继续找他，但卡不办。',
    createdAt: '2024-02-15T11:30:00Z',
  },
];

// 模拟微信支付记录
export type WechatPayRecord = {
  id: string;
  merchantName: string;
  amount: number;
  date: string;
  category: string;
};

export const mockWechatPayRecords: WechatPayRecord[] = [
  { id: 'wx001', merchantName: '长安路老理发', amount: 28, date: '2024-03-25', category: '生活服务' },
  { id: 'wx002', merchantName: 'MODA造型', amount: 398, date: '2024-03-20', category: '生活服务' },
  { id: 'wx003', merchantName: '木北造型', amount: 98, date: '2024-03-10', category: '生活服务' },
];

// 全局状态管理
// 支持本地模式（默认）和云端模式（配置Supabase后）
class Store {
  private shops: Shop[] = [...initialShops];
  private barbers: Barber[] = [...initialBarbers];
  private externalNotes: ExternalNote[] = [...initialExternalNotes];
  private records: HaircutRecord[] = [...initialRecords];
  private listeners: Set<() => void> = new Set();
  private initialized: boolean = false;
  private useCloud: boolean = false;

  // 初始化：尝试连接云端
  async init() {
    if (this.initialized) return;
    
    if (isSupabaseConfigured()) {
      try {
        await api.init();
        this.useCloud = true;
        await this.loadFromCloud();
        console.log('已连接Supabase云端');
      } catch (error) {
        console.log('云端连接失败，使用本地模式', error);
        this.useCloud = false;
      }
    } else {
      console.log('Supabase未配置，使用本地模式');
    }
    
    this.initialized = true;
  }

  // 从云端加载数据
  private async loadFromCloud() {
    try {
      const [cloudShops, cloudBarbers, cloudRecords] = await Promise.all([
        api.getShops(),
        api.getAllBarbers(),
        api.getAllRecords(),
      ]);

      if (cloudShops.length > 0) {
        this.shops = cloudShops;
      }
      if (cloudBarbers.length > 0) {
        // 转换Barber格式
        this.barbers = cloudBarbers.map(b => ({
          ...b,
          yearsOfExperience: b.yearsOfExperience,
          works: [],
        }));
      }
      if (cloudRecords.length > 0) {
        this.records = cloudRecords;
      }

      this.notify();
    } catch (error) {
      console.error('加载云端数据失败:', error);
    }
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // ===== 店铺相关 =====
  getShops() {
    return this.shops;
  }

  getShopById(id: number) {
    return this.shops.find((s) => s.id === id);
  }

  getShopsByCategory(category: ShopCategory) {
    return this.shops.filter((s) => s.category === category);
  }

  getFavoriteShops() {
    return this.shops.filter((s) => s.isFavorite);
  }

  async addShop(shop: Omit<Shop, 'id' | 'isFavorite' | 'barberIds'>) {
    if (this.useCloud) {
      const cloudShop = await api.addShop(shop);
      if (cloudShop) {
        this.shops = [...this.shops, cloudShop];
        this.notify();
        return cloudShop;
      }
    }

    // 本地模式
    const newShop: Shop = {
      ...shop,
      id: Math.max(...this.shops.map((s) => s.id), 0) + 1,
      barberIds: [],
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };
    this.shops = [...this.shops, newShop];
    this.notify();
    return newShop;
  }

  async toggleFavorite(shopId: number) {
    if (this.useCloud) {
      const newState = await api.toggleFavorite(shopId);
      this.shops = this.shops.map((s) =>
        s.id === shopId ? { ...s, isFavorite: newState } : s
      );
    } else {
      this.shops = this.shops.map((s) =>
        s.id === shopId ? { ...s, isFavorite: !s.isFavorite } : s
      );
    }
    this.notify();
  }

  // ===== 理发师相关 =====
  getBarbersByShopId(shopId: number) {
    return this.barbers.filter((b) => b.shopId === shopId);
  }

  getBarberById(id: number) {
    return this.barbers.find((b) => b.id === id);
  }

  getRecommendedBarbers() {
    return this.barbers.filter((b) => b.isRecommended);
  }

  // ===== 外部笔记相关 =====
  getNotesByShopId(shopId: number) {
    return this.externalNotes.filter((n) => n.shopId === shopId);
  }

  getNotesByBarberId(barberId: number) {
    return this.externalNotes.filter((n) => n.barberId === barberId);
  }

  getAllNotes() {
    return this.externalNotes;
  }

  // ===== 理发记录相关 =====
  getAllRecords() {
    return [...this.records].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  getRecordsByShopId(shopId: number) {
    return this.records.filter((r) => r.shopId === shopId);
  }

  getRecordsByBarberId(barberId: number) {
    return this.records.filter((r) => r.barberId === barberId);
  }

  async addRecord(record: Omit<HaircutRecord, 'id'>) {
    if (this.useCloud) {
      const cloudRecord = await api.addRecord(record);
      if (cloudRecord) {
        this.records = [...this.records, cloudRecord];
        this.notify();
        return cloudRecord;
      }
    }

    // 本地模式
    const newRecord: HaircutRecord = {
      ...record,
      id: Math.max(...this.records.map((r) => r.id), 0) + 1,
      createdAt: new Date().toISOString(),
    };
    this.records = [...this.records, newRecord];
    this.notify();
    return newRecord;
  }

  findShopByMerchantName(merchantName: string) {
    return this.shops.find(
      (s) => s.name.includes(merchantName) || merchantName.includes(s.name)
    );
  }

  // ===== 云端状态 =====
  isCloudMode() {
    return this.useCloud;
  }

  isInitialized() {
    return this.initialized;
  }
}

export const store = new Store();

// 初始化store（应用启动时调用）
store.init().catch(console.error);

// React Hook
import { useState, useEffect } from 'react';

export function useStore() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    // 订阅数据变更
    const unsubscribe = store.subscribe(() => forceUpdate({}));
    
    // 确保已初始化
    if (!store.isInitialized()) {
      store.init().then(() => forceUpdate({}));
    }
    
    return () => {
      unsubscribe();
    };
  }, []);

  return store;
}
