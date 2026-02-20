# 发布检查清单

在发布到 npm 之前，请确保完成以下所有步骤：

## 📋 发布前检查

### 1. 代码质量

- [ ] 所有代码已提交到 Git
- [ ] 没有未跟踪的文件
- [ ] 代码已通过 TypeScript 编译（`npm run build`）
- [ ] 没有 TypeScript 错误

### 2. 文档更新

- [ ] README.md 已更新
- [ ] CHANGELOG.md 已添加新版本记录
- [ ] 所有示例代码已测试
- [ ] API 文档已更新（如有变更）

### 3. 配置文件

- [ ] package.json 中的信息正确
  - [ ] name（包名）
  - [ ] version（版本号）
  - [ ] description（描述）
  - [ ] author（作者）
  - [ ] repository（仓库地址）
  - [ ] keywords（关键词）
- [ ] .npmignore 配置正确
- [ ] LICENSE 文件存在

### 4. 功能测试

- [ ] 本地构建成功（`npm run build`）
- [ ] 可以正常启动（`npm start`）
- [ ] 环境变量配置正确
- [ ] 所有工具功能正常

### 5. npm 准备

- [ ] 已注册 npm 账号
- [ ] 已验证邮箱
- [ ] 已登录 npm（`npm whoami`）
- [ ] 包名未被占用（`npm search <package-name>`）

### 6. Git 准备

- [ ] 已创建 GitHub 仓库
- [ ] 本地代码已推送到 GitHub
- [ ] README.md 中的链接已更新为实际仓库地址
- [ ] package.json 中的 repository 字段已更新

## 🚀 发布步骤

### 自动发布（推荐）

```bash
# Linux/Mac
./publish.sh patch  # 或 minor, major

# Windows
publish.bat patch  # 或 minor, major
```

### 手动发布

```bash
# 1. 构建
npm run build

# 2. 更新版本
npm version patch  # 或 minor, major

# 3. 推送到 Git
git push
git push --tags

# 4. 发布到 npm
npm publish
```

## ✅ 发布后检查

### 1. npm 验证

- [ ] 访问 npm 包页面：https://www.npmjs.com/package/codex-mcp-server
- [ ] 检查版本号是否正确
- [ ] 检查文件列表是否正确
- [ ] 测试安装：`npm install -g codex-mcp-server`

### 2. GitHub 验证

- [ ] 创建 GitHub Release
- [ ] 标签格式：`v1.0.0`
- [ ] 标题：`Release v1.0.0`
- [ ] 描述：从 CHANGELOG.md 复制
- [ ] 附加构建产物（可选）

### 3. 功能验证

```bash
# 全局安装
npm install -g codex-mcp-server

# 测试命令
codex-mcp --help

# 添加到 Claude Code
claude mcp add --scope user codex -- codex-mcp

# 在 Claude Code 中测试
# Claude, list all available MCP tools
```

### 4. 文档验证

- [ ] README.md 在 npm 页面显示正确
- [ ] 所有链接可访问
- [ ] 徽章显示正确

## 🔄 版本号规则

遵循语义化版本（Semver）：

- **Patch (1.0.0 → 1.0.1)**: Bug 修复，向后兼容

  ```bash
  npm version patch
  ```

- **Minor (1.0.0 → 1.1.0)**: 新功能，向后兼容

  ```bash
  npm version minor
  ```

- **Major (1.0.0 → 2.0.0)**: 破坏性变更，不向后兼容
  ```bash
  npm version major
  ```

## 📝 CHANGELOG 模板

```markdown
## [1.0.1] - 2026-02-21

### Fixed

- 修复 xxx 问题
- 改进 xxx 功能

### Changed

- 更新 xxx 依赖

### Added

- 新增 xxx 功能
```

## 🆘 常见问题

### 发布失败：包名已存在

**解决**：使用 scoped package

```json
{
  "name": "@your-username/codex-mcp-server"
}
```

发布时：`npm publish --access public`

### 发布失败：未验证邮箱

**解决**：登录 npm 网站验证邮箱

### 发布失败：权限不足

**解决**：检查登录账号

```bash
npm whoami
npm logout
npm login
```

### Git 推送失败

**解决**：检查远程仓库配置

```bash
git remote -v
git remote set-url origin <your-repo-url>
```

## 📞 需要帮助？

- npm 文档：https://docs.npmjs.com/
- 语义化版本：https://semver.org/
- GitHub Releases：https://docs.github.com/en/repositories/releasing-projects-on-github

---

**准备好了？开始发布！** 🚀
