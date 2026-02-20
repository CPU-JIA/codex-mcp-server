#!/bin/bash

# Codex MCP Server - 发布脚本
# 使用方法: ./publish.sh [patch|minor|major]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Codex MCP Server 发布脚本${NC}"
echo ""

# 检查是否有未提交的更改
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}❌ 错误: 有未提交的更改${NC}"
    echo "请先提交所有更改："
    git status -s
    exit 1
fi

# 检查是否在 main 分支
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$BRANCH" != "main" && "$BRANCH" != "master" ]]; then
    echo -e "${YELLOW}⚠️  警告: 当前不在 main/master 分支 (当前: $BRANCH)${NC}"
    read -p "是否继续? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 获取版本类型
VERSION_TYPE=${1:-patch}
if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo -e "${RED}❌ 错误: 版本类型必须是 patch, minor 或 major${NC}"
    exit 1
fi

echo -e "${GREEN}📦 准备发布 ($VERSION_TYPE 版本)...${NC}"
echo ""

# 运行测试（如果有）
if grep -q "\"test\":" package.json; then
    echo -e "${GREEN}🧪 运行测试...${NC}"
    npm test
fi

# 构建项目
echo -e "${GREEN}🔨 构建项目...${NC}"
npm run build

# 更新版本号
echo -e "${GREEN}📝 更新版本号...${NC}"
npm version $VERSION_TYPE

# 获取新版本号
NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}✅ 新版本: v$NEW_VERSION${NC}"
echo ""

# 推送到 Git
echo -e "${GREEN}📤 推送到 Git...${NC}"
git push
git push --tags

# 发布到 npm
echo -e "${GREEN}📦 发布到 npm...${NC}"
npm publish

echo ""
echo -e "${GREEN}🎉 发布成功! v$NEW_VERSION${NC}"
echo ""
echo "下一步:"
echo "1. 在 GitHub 上创建 Release: https://github.com/CPU-JIA/codex-mcp-server/releases/new"
echo "2. 标签: v$NEW_VERSION"
echo "3. 标题: Release v$NEW_VERSION"
echo "4. 描述: 从 CHANGELOG.md 复制"
echo ""
echo "用户现在可以通过以下方式安装:"
echo "  npm install -g @cpujia/codex-mcp-server"
echo "  claude mcp add --scope user codex -- codex-mcp"
