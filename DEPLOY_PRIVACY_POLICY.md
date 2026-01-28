# 隐私政策页面部署指南

## 📋 概述

为了完成华为应用市场的上架申请，您需要提供一个可公开访问的隐私政策 URL。本文档将指导您快速部署隐私政策页面。

## ✅ 已准备的文件

项目已包含以下文件：
- `public/privacy-policy.html` - 隐私政策 HTML 页面
- `PRIVACY_POLICY.md` - 隐私政策 Markdown 源文件

## 🚀 部署方法

### 方法一：使用 Vercel（推荐）

1. **确保文件已提交到 Git**
   ```bash
   git add public/privacy-policy.html
   git commit -m "Add privacy policy page"
   git push
   ```

2. **Vercel 会自动部署**
   - 如果项目已连接 Vercel，推送代码后会自动部署
   - 部署完成后，访问：`https://haircut-treasure-map.vercel.app/privacy-policy.html`

3. **验证访问**
   - 在浏览器中打开上述 URL
   - 确认页面可以正常显示
   - 复制该 URL 用于填写华为应用市场表单

### 方法二：手动部署到 Vercel

如果项目还没有连接到 Vercel：

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   vercel --prod
   ```

4. **访问隐私政策页面**
   - 部署完成后会显示部署 URL
   - 访问：`https://your-project.vercel.app/privacy-policy.html`

### 方法三：使用 GitHub Pages

1. **创建 GitHub 仓库**（如果还没有）

2. **上传 HTML 文件**
   - 将 `public/privacy-policy.html` 上传到仓库根目录

3. **启用 GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source 选择 `main` 分支
   - 保存设置

4. **访问页面**
   - 访问：`https://your-username.github.io/repo-name/privacy-policy.html`

### 方法四：使用其他静态托管服务

您也可以使用以下服务：
- **Netlify**：拖拽 `public` 文件夹到 Netlify
- **Cloudflare Pages**：连接 GitHub 仓库自动部署
- **阿里云 OSS**：上传 HTML 文件并设置为静态网站托管

## 🔍 验证部署

部署完成后，请验证：

1. ✅ URL 可以正常访问
2. ✅ 页面内容完整显示
3. ✅ 页面支持 HTTPS（华为要求）
4. ✅ 移动端可以正常访问

## 📝 填写华为应用市场表单

部署完成后，在华为应用市场表单中填写：

**隐私政策网址：**
```
https://haircut-treasure-map.vercel.app/privacy-policy.html
```
（请替换为您的实际部署 URL）

**隐私权利：**（可选）
```
https://haircut-treasure-map.vercel.app/privacy-policy.html
```
（可以填写与隐私政策相同的 URL）

## ⚠️ 注意事项

1. **URL 必须可公开访问**
   - 不能需要登录
   - 不能有访问限制

2. **必须使用 HTTPS**
   - HTTP 链接可能被拒绝
   - 确保部署平台支持 HTTPS

3. **内容必须完整**
   - 确保所有章节都显示正常
   - 检查格式和排版

4. **保持更新**
   - 如果隐私政策有更新，记得同步更新 HTML 文件
   - 重新部署以确保华为审核时看到最新版本

## 🆘 遇到问题？

如果部署遇到问题：

1. **检查文件路径**
   - 确保 `public/privacy-policy.html` 文件存在
   - 检查文件名和路径是否正确

2. **检查 Vercel 配置**
   - 查看 `vercel.json` 配置是否正确
   - 确认构建输出目录设置

3. **查看部署日志**
   - 在 Vercel 控制台查看部署日志
   - 检查是否有错误信息

4. **联系支持**
   - Vercel 支持：https://vercel.com/support
   - 或查看项目 README 中的联系方式

---

**最后更新：** 2026年1月28日
