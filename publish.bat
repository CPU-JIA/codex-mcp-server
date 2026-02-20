@echo off
REM Codex MCP Server - Windows 发布脚本
REM 使用方法: publish.bat [patch|minor|major]

setlocal enabledelayedexpansion

echo 🚀 Codex MCP Server 发布脚本
echo.

REM 检查是否有未提交的更改
git status --short > nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 不是 Git 仓库
    exit /b 1
)

for /f %%i in ('git status --short') do (
    echo ❌ 错误: 有未提交的更改
    echo 请先提交所有更改:
    git status --short
    exit /b 1
)

REM 获取版本类型
set VERSION_TYPE=%1
if "%VERSION_TYPE%"=="" set VERSION_TYPE=patch

if not "%VERSION_TYPE%"=="patch" if not "%VERSION_TYPE%"=="minor" if not "%VERSION_TYPE%"=="major" (
    echo ❌ 错误: 版本类型必须是 patch, minor 或 major
    exit /b 1
)

echo 📦 准备发布 (%VERSION_TYPE% 版本)...
echo.

REM 构建项目
echo 🔨 构建项目...
call npm run build
if errorlevel 1 (
    echo ❌ 构建失败
    exit /b 1
)

REM 更新版本号
echo 📝 更新版本号...
call npm version %VERSION_TYPE%
if errorlevel 1 (
    echo ❌ 版本更新失败
    exit /b 1
)

REM 获取新版本号
for /f "tokens=*" %%i in ('node -p "require('./package.json').version"') do set NEW_VERSION=%%i
echo ✅ 新版本: v%NEW_VERSION%
echo.

REM 推送到 Git
echo 📤 推送到 Git...
git push
git push --tags

REM 发布到 npm
echo 📦 发布到 npm...
call npm publish
if errorlevel 1 (
    echo ❌ 发布失败
    exit /b 1
)

echo.
echo 🎉 发布成功! v%NEW_VERSION%
echo.
echo 下一步:
echo 1. 在 GitHub 上创建 Release: https://github.com/CPU-JIA/codex-mcp-server/releases/new
echo 2. 标签: v%NEW_VERSION%
echo 3. 标题: Release v%NEW_VERSION%
echo 4. 描述: 从 CHANGELOG.md 复制
echo.
echo 用户现在可以通过以下方式安装:
echo   npm install -g @cpujia/codex-mcp-server
echo   claude mcp add --scope user codex -- codex-mcp

endlocal
