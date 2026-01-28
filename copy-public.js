// 构建后脚本：将 public 目录下的文件复制到 dist 目录
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const distDir = path.join(__dirname, 'dist');

// 确保 dist 目录存在
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 如果 public 目录存在，复制其中的文件
if (fs.existsSync(publicDir)) {
  const files = fs.readdirSync(publicDir);
  
  files.forEach(file => {
    const srcPath = path.join(publicDir, file);
    const destPath = path.join(distDir, file);
    
    const stat = fs.statSync(srcPath);
    
    if (stat.isFile()) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${file}`);
    }
  });
  
  console.log('Public files copied to dist directory');
} else {
  console.log('Public directory not found, skipping copy');
}
