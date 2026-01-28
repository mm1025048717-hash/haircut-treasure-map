# 构建Android APK指南

## 前置准备

1. **注册Expo账号**
   - 访问 https://expo.dev 注册账号
   - 记住你的用户名和密码

2. **配置Supabase（可选）**
   - 如果要使用云端功能，请先按照 `supabase/README.md` 配置Supabase
   - 修改 `src/lib/supabase.ts` 填入你的Supabase URL和Key
   - 如果不配置，应用会使用本地模式运行

## 构建步骤

### 1. 安装EAS CLI

```bash
npm install -g eas-cli
```

### 2. 登录Expo账号

```bash
eas login
```
输入你的Expo用户名和密码

### 3. 配置EAS项目

首次构建需要配置项目：

```bash
eas build:configure
```

按提示操作，会自动关联到你的Expo账号

### 4. 构建APK

**预览版（推荐，用于测试）：**
```bash
eas build --platform android --profile preview
```

**正式版：**
```bash
eas build --platform android --profile production
```

### 5. 等待构建完成

- 构建通常需要10-20分钟
- 完成后会显示APK下载链接
- 也可以在 https://expo.dev 的项目页面下载

## 安装APK

1. 将APK文件传输到Android手机
2. 在手机上点击APK文件
3. 如果提示"未知来源"，请在设置中允许安装
4. 安装完成后即可使用

## 常见问题

### Q: 构建失败怎么办？
A: 查看构建日志，常见原因：
- 网络问题：使用VPN或稍后重试
- 配置问题：检查app.json格式
- 依赖问题：运行 `npm install` 后重试

### Q: 首次构建很慢？
A: 正常现象，后续构建会使用缓存，速度会快很多

### Q: 如何更新版本？
A: 修改 `app.json` 中的：
- `version`: 显示版本号（如 "1.0.1"）
- `android.versionCode`: 内部版本号（每次递增，如 2）

然后重新运行构建命令

### Q: 免费额度用完了？
A: Expo免费版每月30次构建，超出后：
- 等下个月重置
- 升级到付费版
- 使用本地构建（需配置Android开发环境）

## 本地构建（高级）

如果需要不依赖Expo云的本地构建：

1. 安装Android Studio和Android SDK
2. 运行 `npx expo prebuild`
3. 用Android Studio打开 `android` 文件夹
4. Build > Build Bundle(s) / APK(s) > Build APK(s)

## 联系支持

如有问题，可以：
- 查看Expo文档：https://docs.expo.dev
- 在GitHub提Issue
- 联系开发者
