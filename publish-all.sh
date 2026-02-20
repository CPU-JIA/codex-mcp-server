#!/bin/bash
# 一键发布脚本 - 完整流程

set -e

echo "🚀 Codex MCP Server - 完整发布流程"
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

echo "📋 步骤 1/5: 初始化 Git 仓库"
if [ ! -d ".git" ]; then
    git init
    git add .
    git commit -m "Initial commit: Codex MCP Server v1.0.0"
    echo "✅ Git 仓库已初始化"
else
    echo "✅ Git 仓库已存在"
fi

echo ""
echo "📋 步骤 2/5: 添加 GitHub 远程仓库"
if ! git remote | grep -q "origin"; then
    git remote add origin https://github.com/CPU-JIA/codex-mcp-server.git
    echo "✅ 远程仓库已添加"
else
    echo "✅ 远程仓库已存在"
fi

echo ""
echo "📋 步骤 3/5: 推送到 GitHub"
read -p "是否推送到 GitHub? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git branch -M main
    git push -u origin main
    echo "✅ 已推送到 GitHub"
else
    echo "⏭️  跳过推送"
fi

echo ""
echo "📋 步骤 4/5: 构建项目"
npm run build
echo "✅ 构建完成"

echo ""
echo "📋 步骤 5/5: 发布到 npm"
echo "⚠️  请确保已登录 npm (npm login)"
read -p "是否发布到 npm? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm publish --access public
    echo "✅ 已发布到 npm"
else
    echo "⏭️  跳过发布"
fi

echo ""
echo "🎉 完成！"
echo ""
echo "下一步:"
echo "1. 访问 npm: https://www.npmjs.com/package/@cpujia/codex-mcp-server"
echo "2. 创建 GitHub Release: https://github.com/CPU-JIA/codex-mcp-server/releases/new"
echo "3. 测试安装: npm install -g @cpujia/codex-mcp-server"
echo ""
echo "用户安装命令:"
echo "  npm install -g @cpujia/codex-mcp-server"
echo "  claude mcp add --scope user codex -- codex-mcp"
