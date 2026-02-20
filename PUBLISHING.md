# 发布到 npm 指南

## 📋 发布前检查清单

- [ ] 已注册 npm 账号
- [ ] 已验证邮箱
- [ ] 项目已构建（`npm run build`）
- [ ] 所有测试通过
- [ ] 更新了版本号
- [ ] 更新了 CHANGELOG.md
- [ ] 更新了 README.md

## 🚀 发布步骤

### 1. 登录 npm

```bash
npm login
```

输入你的 npm 用户名、密码和邮箱。

### 2. 检查包名是否可用

```bash
npm search codex-mcp-server
```

如果已被占用，需要修改 `package.json` 中的 `name` 字段。

**建议的包名**（如果 `codex-mcp-server` 被占用）：

- `@your-username/codex-mcp-server`（scoped package）
- `codex-mcp`
- `mcp-codex-server`
- `openai-codex-mcp`

### 3. 测试打包

```bash
# 查看将要发布的文件
npm pack --dry-run

# 实际打包（生成 .tgz 文件）
npm pack
```

检查生成的 `.tgz` 文件，确保包含正确的文件。

### 4. 发布到 npm

```bash
# 首次发布
npm publish

# 如果使用 scoped package（@your-username/xxx）
npm publish --access public
```

### 5. 验证发布

```bash
# 查看包信息
npm view codex-mcp-server

# 测试安装
npm install -g codex-mcp-server
```

## 📦 用户安装方式

发布成功后，用户可以通过以下方式安装：

### 方式 A：全局安装（推荐）

```bash
npm install -g codex-mcp-server
```

安装后，用户可以直接使用：

```bash
# 查看安装路径
which codex-mcp  # Linux/Mac
where codex-mcp  # Windows

# 添加到 Claude Code
claude mcp add --scope user codex -- codex-mcp
```

### 方式 B：项目本地安装

```bash
npm install codex-mcp-server
```

然后配置：

```bash
claude mcp add --scope user codex -- npx codex-mcp-server
```

### 方式 C：使用 npx（无需安装）

```bash
claude mcp add --scope user codex -- npx codex-mcp-server
```

## 🔄 更新版本

### 更新版本号

```bash
# 补丁版本（1.0.0 -> 1.0.1）
npm version patch

# 小版本（1.0.0 -> 1.1.0）
npm version minor

# 大版本（1.0.0 -> 2.0.0）
npm version major
```

这会自动：

1. 更新 `package.json` 中的版本号
2. 创建 git commit
3. 创建 git tag

### 发布新版本

```bash
# 构建
npm run build

# 发布
npm publish

# 推送 git tag
git push --tags
```

## 📝 版本管理最佳实践

### 语义化版本（Semver）

- **1.0.0** → **1.0.1**：Bug 修复（patch）
- **1.0.0** → **1.1.0**：新功能，向后兼容（minor）
- **1.0.0** → **2.0.0**：破坏性变更（major）

### CHANGELOG.md 示例

```markdown
# Changelog

## [1.0.1] - 2026-02-20

### Fixed

- 修复 xhigh 推理强度配置问题
- 改进错误处理

## [1.0.0] - 2026-02-20

### Added

- 初始版本发布
- 支持 GPT-5.3-Codex
- 5 个专业工具
- 完整文档
```

## 🔐 安全建议

### 使用 .npmignore

确保不发布敏感文件：

```
# .npmignore
src/
.env
.env.example
*.log
.DS_Store
tsconfig.json
node_modules/
EXAMPLES.md
QUICKSTART.md
GPT-5.3-CODEX-CONFIG.md
CLAUDE_CODE_CONFIG.md
```

### 使用 2FA（双因素认证）

```bash
# 启用 2FA
npm profile enable-2fa auth-and-writes
```

## 📊 发布后的推广

### 1. 更新 README.md

添加安装徽章：

```markdown
[![npm version](https://badge.fury.io/js/codex-mcp-server.svg)](https://www.npmjs.com/package/codex-mcp-server)
[![npm downloads](https://img.shields.io/npm/dm/codex-mcp-server.svg)](https://www.npmjs.com/package/codex-mcp-server)
```

### 2. 创建 GitHub Release

在 GitHub 上创建 Release，附上 CHANGELOG。

### 3. 分享到社区

- MCP Discord
- Reddit (r/ClaudeAI, r/programming)
- Twitter/X
- Hacker News

## 🛠️ 常见问题

### Q1: 包名已被占用

**解决**：使用 scoped package

```json
{
  "name": "@your-username/codex-mcp-server"
}
```

发布时：

```bash
npm publish --access public
```

### Q2: 发布失败 "You must verify your email"

**解决**：登录 npm 网站验证邮箱。

### Q3: 发布失败 "You do not have permission"

**解决**：检查是否登录正确账号：

```bash
npm whoami
```

### Q4: 如何撤销已发布的版本

```bash
# 撤销特定版本（24小时内）
npm unpublish codex-mcp-server@1.0.0

# 撤销整个包（24小时内）
npm unpublish codex-mcp-server --force
```

**注意**：超过 24 小时后无法撤销，只能发布新版本。

### Q5: 如何弃用某个版本

```bash
npm deprecate codex-mcp-server@1.0.0 "This version has a critical bug, please upgrade to 1.0.1"
```

## 📈 监控下载量

```bash
# 查看下载统计
npm view codex-mcp-server

# 查看详细信息
npm info codex-mcp-server
```

或访问：https://www.npmjs.com/package/codex-mcp-server

## 🎯 发布成功后

用户可以通过以下方式使用：

```bash
# 安装
npm install -g codex-mcp-server

# 使用
claude mcp add --scope user codex -- codex-mcp

# 或使用 npx（无需安装）
claude mcp add --scope user codex -- npx codex-mcp-server
```

---

**祝发布顺利！** 🚀
