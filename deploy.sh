#!/bin/bash
# 本地直连部署脚本 (Standalone 打包上传方案)

SERVER="r"  # 你的 SSH 别名
APP_DIR="/var/www/planets.run"

echo "🚀 第一步：开始构建独立的生产版本 (Standalone)..."
npm run build || { echo "构建失败！"; exit 1; }

echo "📦 第二步：整理 standalone 静态文件..."
REAL_STANDALONE=".next/standalone"

rm -rf "${REAL_STANDALONE}/.next/static" 2>/dev/null || true
cp -r .next/static "${REAL_STANDALONE}/.next/"
cp -r public "${REAL_STANDALONE}/"

PROJECT_ROOT=$(pwd)
echo "🤐 第三步：正在打包压缩..."
cd "${REAL_STANDALONE}"
# 禁用 macOS 特有的附加属性，并将压缩包直接写回项目根目录
env COPYFILE_DISABLE=1 tar -czf "${PROJECT_ROOT}/planets.tar.gz" .
cd "${PROJECT_ROOT}"

echo "📤 第四步：发送压缩包到服务器 ${SERVER}..."
scp planets.tar.gz ${SERVER}:~/

echo "🔄 第五步：在服务器上解压并重启 PM2 服务..."
ssh ${SERVER} "sudo tar --warning=no-unknown-keyword -xzf ~/planets.tar.gz -C ${APP_DIR} && \
sudo chown -R \$USER:\$USER ${APP_DIR} && \
cd ${APP_DIR} && \
npx pm2 restart planets.run"

echo "✅ 部署完成！"
