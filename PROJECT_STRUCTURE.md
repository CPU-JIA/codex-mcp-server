# Codex MCP Server

完整的 MCP Server 实现，用于将 OpenAI Codex `/v1/responses` API 集成到 Claude Code。

## 📁 项目结构

```
codex-mcp-server/
├── src/                          # 源代码
│   ├── index.ts                  # MCP Server 主入口
│   ├── codex-client.ts           # Codex API 客户端
│   └── tools.ts                  # 工具定义
├── dist/                         # 编译输出
│   ├── index.js
│   ├── index.d.ts
│   ├── codex-client.js
│   ├── codex-client.d.ts
│   ├── tools.js
│   └── tools.d.ts
├── node_modules/                 # 依赖包
├── .env.example                  # 环境变量模板
├── .gitignore                    # Git 忽略规则
├── .npmignore                    # npm 发布忽略规则
├── package.json                  # 项目配置
├── package-lock.json             # 依赖锁定
├── tsconfig.json                 # TypeScript 配置
├── LICENSE                       # MIT 许可证
├── README.md                     # 项目首页
├── QUICKSTART.md                 # 快速开始指南
├── CLAUDE_CODE_CONFIG.md         # Claude Code 集成配置
├── EXAMPLES.md                   # 使用示例
├── GPT-5.3-CODEX-CONFIG.md       # GPT-5.3-Codex 配置详解
├── PUBLISHING.md                 # npm 发布指南
├── CHANGELOG.md                  # 版本更新日志
├── RELEASE_CHECKLIST.md          # 发布检查清单
├── publish.sh                    # Linux/Mac 发布脚本
└── publish.bat                   # Windows 发布脚本
```

## 🎯 核心文件说明

### 源代码 (src/)

- **index.ts**: MCP Server 主入口，处理工具调用和请求路由
- **codex-client.ts**: Codex API 客户端，封装 `/v1/responses` 调用
- **tools.ts**: 5 个工具的定义和 schema

### 配置文件

- **package.json**: 项目元数据、依赖、脚本
- **tsconfig.json**: TypeScript 编译配置
- **.env.example**: 环境变量模板
- **.gitignore**: Git 忽略规则
- **.npmignore**: npm 发布时忽略的文件

### 文档

- **README.md**: 项目首页，快速了解项目
- **QUICKSTART.md**: 快速开始指南，3 种安装方式
- **CLAUDE_CODE_CONFIG.md**: Claude Code 集成详细配置
- **EXAMPLES.md**: 详细使用示例
- **GPT-5.3-CODEX-CONFIG.md**: GPT-5.3-Codex 配置详解
- **PUBLISHING.md**: npm 发布完整指南
- **CHANGELOG.md**: 版本更新日志
- **RELEASE_CHECKLIST.md**: 发布前检查清单

### 发布脚本

- **publish.sh**: Linux/Mac 自动发布脚本
- **publish.bat**: Windows 自动发布脚本

## 🚀 快速开始

### 用户安装（发布后）

```bash
# 方式 1：npm 全局安装
npm install -g codex-mcp-server
claude mcp add --scope user codex -- codex-mcp

# 方式 2：使用 npx
claude mcp add --scope user codex -- npx codex-mcp-server

# 方式 3：从源码安装
git clone <repo-url>
cd codex-mcp-server
npm install && npm run build
claude mcp add --scope user codex -- node /path/to/dist/index.js
```

### 开发者使用

```bash
# 克隆项目
git clone <repo-url>
cd codex-mcp-server

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env

# 开发模式（监听文件变化）
npm run dev

# 构建
npm run build

# 运行
npm start
```

## 📦 发布流程

### 准备发布

1. 更新 `package.json` 中的仓库地址
2. 更新 `CHANGELOG.md`
3. 确保所有测试通过
4. 提交所有更改

### 发布到 npm

```bash
# Linux/Mac
./publish.sh patch  # 或 minor, major

# Windows
publish.bat patch  # 或 minor, major

# 手动发布
npm login
npm run build
npm version patch
git push && git push --tags
npm publish
```

详细步骤见 [PUBLISHING.md](PUBLISHING.md) 和 [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md)。

## 🛠️ 可用工具

| 工具             | 功能         | 输入                        | 输出         |
| ---------------- | ------------ | --------------------------- | ------------ |
| `codex_generate` | 生成新代码   | prompt, language, context   | 生成的代码   |
| `codex_edit`     | 编辑现有代码 | code, instruction, language | 修改后的代码 |
| `codex_explain`  | 解释代码逻辑 | code, language, focus       | 代码解释     |
| `codex_fix`      | 修复 bug     | code, error, language       | 修复后的代码 |
| `codex_refactor` | 重构代码     | code, goal, language        | 重构后的代码 |

## 🎨 特性

- ✅ GPT-5.3-Codex 支持（最新最强模型）
- ✅ 推理强度控制（xhigh, high, medium, low）
- ✅ 原生 `/v1/responses` API 支持
- ✅ 流式响应（SSE）
- ✅ 完整 TypeScript 类型定义
- ✅ 错误处理、超时、重试机制
- ✅ 环境变量配置
- ✅ Claude Code CLI 集成
- ✅ 跨平台支持（Windows, Linux, macOS）

## 📚 文档导航

- **新手入门**: [QUICKSTART.md](QUICKSTART.md)
- **配置 Claude Code**: [CLAUDE_CODE_CONFIG.md](CLAUDE_CODE_CONFIG.md)
- **使用示例**: [EXAMPLES.md](EXAMPLES.md)
- **GPT-5.3-Codex 配置**: [GPT-5.3-CODEX-CONFIG.md](GPT-5.3-CODEX-CONFIG.md)
- **发布到 npm**: [PUBLISHING.md](PUBLISHING.md)
- **发布检查清单**: [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md)
- **版本历史**: [CHANGELOG.md](CHANGELOG.md)

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md)（待创建）。

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

## 🙏 致谢

- [Anthropic](https://www.anthropic.com/) - Claude Code 和 MCP
- [OpenAI](https://openai.com/) - GPT-5.3-Codex
- [Model Context Protocol](https://modelcontextprotocol.io/) 社区

---

**项目已完全准备好发布！** 🚀
