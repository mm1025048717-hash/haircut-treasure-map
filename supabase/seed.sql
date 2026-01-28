-- 理发指南 种子数据
-- 在schema.sql执行后运行此脚本

-- ========================================
-- 插入示例店铺数据
-- ========================================
INSERT INTO shops (name, address, phone, latitude, longitude, category, avg_price, price_min, price_max, tags, photos) VALUES
(
  '长安路老理发',
  '西城区长安路12号（社区底商）',
  '010-12345678',
  39.9042,
  116.4074,
  'community',
  28,
  20,
  35,
  ARRAY['老年人信赖', '手艺精湛', '20年老店', '修面专业'],
  ARRAY['https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800']
),
(
  '胡同手艺社',
  '东城区南锣鼓巷28号',
  '010-87654321',
  39.9372,
  116.4030,
  'community',
  32,
  25,
  40,
  ARRAY['复古风格', '胡同文化', '老北京特色'],
  ARRAY['https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800']
),
(
  'MODERN发型工作室',
  '朝阳区三里屯SOHO A座',
  '010-55667788',
  39.9339,
  116.4539,
  'studio',
  398,
  198,
  598,
  ARRAY['时尚造型', '网红打卡', '高端服务'],
  ARRAY['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800']
),
(
  '快剪工坊',
  '海淀区中关村大街15号',
  '010-11223344',
  39.9841,
  116.3120,
  'chain',
  25,
  15,
  35,
  ARRAY['快速便捷', '性价比高', '连锁品牌'],
  ARRAY['https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800']
),
(
  '王师傅理发店',
  '丰台区方庄路8号',
  '010-99887766',
  39.8673,
  116.4341,
  'community',
  22,
  15,
  30,
  ARRAY['平价实惠', '老顾客多', '社区信赖'],
  ARRAY['https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800']
);

-- ========================================
-- 插入示例理发师数据
-- ========================================
INSERT INTO barbers (shop_id, name, avatar, gender, experience_years, specialties, rating, rating_count, price_min, price_max, is_recommended) VALUES
-- 长安路老理发的理发师
(1, '张师傅', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', '男', 30, ARRAY['日常修剪', '修面', '老式理发'], 4.9, 328, 20, 30, true),
(1, '李姐', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', '女', 20, ARRAY['烫染', '女士剪发'], 4.7, 156, 25, 35, true),

-- 胡同手艺社的理发师
(2, '老周', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', '男', 25, ARRAY['复古油头', '修面刮脸'], 4.8, 203, 25, 40, true),
(2, '小陈', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200', '男', 5, ARRAY['潮流造型', '渐变'], 4.6, 89, 30, 45, false),

-- MODERN的理发师
(3, 'Tony', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', '男', 8, ARRAY['韩式造型', '烫染设计'], 4.9, 567, 298, 598, true),
(3, 'Kevin', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200', '男', 6, ARRAY['日系风格', '挑染'], 4.8, 423, 198, 498, true),

-- 快剪工坊的理发师
(4, '刘工', 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200', '男', 10, ARRAY['快剪', '商务造型'], 4.5, 892, 15, 25, false),

-- 王师傅理发店
(5, '王师傅', 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200', '男', 35, ARRAY['传统理发', '修面'], 4.8, 1205, 15, 25, true);

-- ========================================
-- 插入示例外部笔记数据
-- ========================================
INSERT INTO external_notes (shop_id, platform, author_name, author_avatar, content, images, rating, tags, likes) VALUES
(1, 'xiaohongshu', '北漂小王', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', '终于找到一家靠谱的社区理发店！张师傅手艺真的绝了，28块钱剪完比我之前花300的还满意。修面用的老式剃刀，第一次体验，太舒服了！关键是不推销不办卡，以后就认准这家了。', ARRAY['https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400'], 5.0, ARRAY['#社区理发', '#老师傅', '#不办卡'], 2341),
(1, 'dianping', '理发达人', 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100', '来北京出差，附近随便找的一家店，没想到是宝藏！价格实惠，手艺好，强烈推荐给住附近的朋友。', ARRAY['https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400'], 4.5, ARRAY['#出差必备', '#性价比'], 156),
(2, 'xiaohongshu', '胡同探店家', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', '南锣鼓巷里的隐藏小店，复古装修超有感觉！老周师傅的油头手艺一绝，还会讲老北京的故事，理发都变成享受了。', ARRAY['https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400'], 5.0, ARRAY['#胡同文化', '#复古理发', '#油头'], 892),
(3, 'xiaohongshu', '时尚博主Luna', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', 'Tony老师太会了！给我设计的发色超级显白，而且很日常不会太夸张。虽然价格不便宜，但是值得！', ARRAY['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400'], 4.8, ARRAY['#染发', '#网红店'], 3567),
(5, 'dianping', '方庄居民', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', '住这边十多年了，一直在王师傅这剪。老人家手艺好，价格十几年没怎么涨，良心店家。', ARRAY[], 5.0, ARRAY['#社区好店', '#老顾客'], 78);

-- ========================================
-- 插入示例理发记录（无user_id，展示用）
-- ========================================
-- 注意：实际使用时user_id应该是真实用户ID
INSERT INTO haircut_records (shop_id, barber_id, date, price, services, rating, note) VALUES
(1, 1, '2024-01-15', 28, ARRAY['剪发', '修面'], 5, '张师傅手艺真好，下次还来'),
(1, 1, '2024-01-02', 25, ARRAY['剪发'], 5, '快过年了来修整一下'),
(2, 3, '2024-01-10', 35, ARRAY['剪发', '造型'], 4, '复古油头很帅'),
(3, 5, '2024-01-08', 398, ARRAY['剪发', '染发'], 5, 'Tony老师审美在线');
