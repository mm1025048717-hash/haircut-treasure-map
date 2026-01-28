// 理发地图 - 数据类型定义

export type Coordinates = {
  latitude: number;
  longitude: number;
};

// 店铺类型标签
export type ShopCategory = 'community' | 'mall' | 'chain' | 'studio';
// community: 社区老店（便宜、手艺好、老年人信赖）
// mall: 商场店（中高端、时尚）
// chain: 连锁品牌店
// studio: 独立工作室

// 店铺模型
export type Shop = {
  id: number;
  name: string;
  location: Coordinates;
  address: string;
  phone?: string;
  category: ShopCategory;     // 店铺类型
  priceRange: [number, number];
  avgPrice: number;
  isFavorite: boolean;
  photos: string[];
  tags: string[];             // 特色标签：老年人推荐、年轻时尚、烫染专业等
  barberIds: number[];        // 店内理发师ID
  createdAt: string;
};

// 理发师模型
export type Barber = {
  id: number;
  shopId: number;
  name: string;
  avatar: string;
  gender: 'male' | 'female';
  age: number;                // 年龄
  yearsOfExperience: number;  // 从业年限
  specialties: string[];      // 擅长：日常修剪、时尚造型、烫发、染发等
  priceRange: [number, number];
  rating: number;             // 平均评分
  ratingCount: number;        // 评价数
  isRecommended: boolean;     // 是否推荐
  description?: string;       // 简介
  works: BarberWork[];        // 作品集
};

// 理发师作品
export type BarberWork = {
  id: number;
  barberId: number;
  imageUrl: string;
  title?: string;
  style: string;              // 发型风格
  gender: 'male' | 'female';  // 适合性别
  createdAt: string;
};

// 外部平台笔记（模拟小红书/大众点评）
export type ExternalNote = {
  id: string;
  shopId: number;
  barberId?: number;
  platform: 'xiaohongshu' | 'dianping';  // 来源平台
  authorName: string;
  authorAvatar: string;
  content: string;
  images: string[];
  likes: number;
  rating?: number;            // 大众点评有评分
  tags: string[];
  createdAt: string;
};

// 理发记录模型
export type HaircutRecord = {
  id: number;
  shopId: number;
  barberId?: number;          // 可选关联理发师
  date: string;
  price: number;
  services: string[];
  rating: number;
  note?: string;
  photos?: string[];          // 理发前后照片
  createdAt: string;
};

// 筛选器
export type FilterState = {
  priceRange: [number, number] | null;
  category: ShopCategory | null;
  onlyFavorites: boolean;
};
