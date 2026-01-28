-- 理发藏宝图 数据库表结构
-- 在Supabase SQL Editor中执行此脚本

-- ========================================
-- 1. 店铺表
-- ========================================
CREATE TABLE IF NOT EXISTS shops (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(20),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  category VARCHAR(20) DEFAULT 'community',
  avg_price INTEGER DEFAULT 0,
  price_min INTEGER DEFAULT 0,
  price_max INTEGER DEFAULT 100,
  tags TEXT[] DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. 理发师表
-- ========================================
CREATE TABLE IF NOT EXISTS barbers (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  avatar TEXT,
  gender VARCHAR(10),
  experience_years INTEGER DEFAULT 0,
  specialties TEXT[] DEFAULT '{}',
  rating DECIMAL(2,1) DEFAULT 5.0,
  rating_count INTEGER DEFAULT 0,
  price_min INTEGER,
  price_max INTEGER,
  is_recommended BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. 理发师作品表
-- ========================================
CREATE TABLE IF NOT EXISTS barber_works (
  id SERIAL PRIMARY KEY,
  barber_id INTEGER REFERENCES barbers(id) ON DELETE CASCADE,
  photo TEXT NOT NULL,
  style VARCHAR(50),
  gender VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. 理发记录表
-- ========================================
CREATE TABLE IF NOT EXISTS haircut_records (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
  barber_id INTEGER REFERENCES barbers(id),
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  price DECIMAL(8,2) NOT NULL,
  services TEXT[] DEFAULT '{}',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  note TEXT,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. 外部笔记表（小红书/大众点评等）
-- ========================================
CREATE TABLE IF NOT EXISTS external_notes (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL, -- 'xiaohongshu', 'dianping'
  author_name VARCHAR(50),
  author_avatar TEXT,
  content TEXT,
  images TEXT[] DEFAULT '{}',
  rating DECIMAL(2,1),
  tags TEXT[] DEFAULT '{}',
  likes INTEGER DEFAULT 0,
  external_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 6. 收藏表
-- ========================================
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, shop_id)
);

-- ========================================
-- 7. 用户资料表（扩展auth.users）
-- ========================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname VARCHAR(50),
  avatar TEXT,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 启用行级安全策略 (RLS)
-- ========================================
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE haircut_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 安全策略：公开读取
-- ========================================
-- 所有人可查看店铺
CREATE POLICY "Anyone can view shops" ON shops 
  FOR SELECT USING (true);

-- 所有人可查看理发师
CREATE POLICY "Anyone can view barbers" ON barbers 
  FOR SELECT USING (true);

-- 所有人可查看理发师作品
CREATE POLICY "Anyone can view barber works" ON barber_works 
  FOR SELECT USING (true);

-- 所有人可查看外部笔记
CREATE POLICY "Anyone can view external notes" ON external_notes 
  FOR SELECT USING (true);

-- 所有人可查看理发记录（匿名显示）
CREATE POLICY "Anyone can view haircut records" ON haircut_records 
  FOR SELECT USING (true);

-- ========================================
-- 安全策略：认证用户操作
-- ========================================
-- 认证用户可添加店铺
CREATE POLICY "Auth users can insert shops" ON shops 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 认证用户可更新自己创建的店铺
CREATE POLICY "Users can update own shops" ON shops 
  FOR UPDATE USING (auth.uid() = created_by);

-- 认证用户可添加理发记录
CREATE POLICY "Auth users can insert records" ON haircut_records 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 用户只能更新/删除自己的记录
CREATE POLICY "Users can update own records" ON haircut_records 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own records" ON haircut_records 
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- 安全策略：收藏管理
-- ========================================
CREATE POLICY "Users can view own favorites" ON favorites 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favorites 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites 
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- 安全策略：用户资料
-- ========================================
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ========================================
-- 触发器：自动创建用户资料
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 新用户注册时自动创建profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 索引优化
-- ========================================
CREATE INDEX IF NOT EXISTS idx_shops_location ON shops (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_shops_category ON shops (category);
CREATE INDEX IF NOT EXISTS idx_barbers_shop ON barbers (shop_id);
CREATE INDEX IF NOT EXISTS idx_records_shop ON haircut_records (shop_id);
CREATE INDEX IF NOT EXISTS idx_records_user ON haircut_records (user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_notes_shop ON external_notes (shop_id);
