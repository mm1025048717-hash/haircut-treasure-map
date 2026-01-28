# Supabase 后端配置指南

## 第一步：创建Supabase项目

1. 访问 https://supabase.com 并注册账号
2. 点击 "New Project" 创建新项目
3. 填写项目信息：
   - **Name**: haircut-treasure-map
   - **Database Password**: 设置一个强密码（记住它）
   - **Region**: 选择 Singapore（离中国最近）
4. 等待项目创建完成（约2分钟）

## 第二步：获取API密钥

1. 进入项目后，点击左侧 **Settings** > **API**
2. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIs...`

3. 将这些信息填入 `src/lib/supabase.ts` 文件

## 第三步：创建数据库表

1. 点击左侧 **SQL Editor**
2. 点击 **New Query**
3. 复制 `schema.sql` 文件的全部内容并粘贴
4. 点击 **Run** 执行
5. 看到成功提示后，再执行 `seed.sql` 插入示例数据

## 第四步：配置存储桶（可选，用于图片上传）

1. 点击左侧 **Storage**
2. 点击 **New Bucket**
3. 创建名为 `photos` 的存储桶
4. 设置为 **Public bucket**（公开访问）

## 第五步：配置认证（可选）

### 启用手机号登录：
1. 点击左侧 **Authentication** > **Providers**
2. 启用 **Phone**
3. 配置短信服务商（如阿里云SMS）

### 启用匿名登录：
1. 点击左侧 **Authentication** > **Providers**
2. 启用 **Anonymous Sign-ins**

## 验证配置

执行以下SQL验证表是否创建成功：

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

应该看到：shops, barbers, barber_works, haircut_records, external_notes, favorites, profiles

## 常见问题

### Q: RLS策略导致无法读取数据？
A: 确保已执行 schema.sql 中的所有 CREATE POLICY 语句

### Q: 外键约束失败？
A: 按顺序执行：先 schema.sql，再 seed.sql

### Q: 如何查看API请求日志？
A: 点击左侧 **Logs** > **API Logs**
