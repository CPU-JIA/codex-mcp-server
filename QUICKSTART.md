# Codex MCP Server - 快速开始指南

## 📦 安装

### 方式 A：通过 npm 安装（推荐 ⭐⭐⭐）

```bash
# 全局安装
npm install -g @cpujia/codex-mcp-server

# 配置环境变量（可选，也可以在 Claude Code 配置中设置）
export CODEX_API_BASE_URL=https://your-codex-service.com/v1
export CODEX_API_KEY=your-api-key-here
export CODEX_MODEL=gpt-5.3-codex
export CODEX_REASONING_EFFORT=xhigh

# 添加到 Claude Code
claude mcp add --scope user codex -- codex-mcp
```

### 方式 B：使用 npx（无需安装）

```bash
# 直接使用 npx
claude mcp add --scope user codex -- npx @cpujia/codex-mcp-server
```

### 方式 C：从源码安装

```bash
# 克隆仓库
git clone https://github.com/CPU-JIA/codex-mcp-server.git
cd codex-mcp-server

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 构建
npm run build

# 添加到 Claude Code
claude mcp add --scope user codex -- node /absolute/path/to/codex-mcp-server/dist/index.js
```

## 🚀 配置 Claude Code

### 使用命令行配置（推荐 ⭐⭐⭐）

```bash
# 如果通过 npm 全局安装
claude mcp add --scope user codex -- codex-mcp

# 如果使用 npx
claude mcp add --scope user codex -- npx codex-mcp-server

# 如果从源码安装
claude mcp add --scope user codex -- node /absolute/path/to/codex-mcp-server/dist/index.js
```

### 手动编辑配置文件（可选）

编辑 Claude Code 配置文件：

- **Windows**: `%APPDATA%\Claude\mcp.json`
- **Linux/Mac**: `~/.config/claude/mcp.json`

#### 配置示例 1：npm 全局安装

```json
{
  "mcpServers": {
    "codex": {
      "command": "codex-mcp",
      "env": {
        "CODEX_API_BASE_URL": "https://your-codex-service.com/v1",
        "CODEX_API_KEY": "your-api-key-here",
        "CODEX_MODEL": "gpt-5.3-codex",
        "CODEX_REASONING_EFFORT": "xhigh"
      }
    }
  }
}
```

#### 配置示例 2：使用 npx

```json
{
  "mcpServers": {
    "codex": {
      "command": "npx",
      "args": ["@cpujia/codex-mcp-server"],
      "env": {
        "CODEX_API_BASE_URL": "https://your-codex-service.com/v1",
        "CODEX_API_KEY": "your-api-key-here",
        "CODEX_MODEL": "gpt-5.3-codex",
        "CODEX_REASONING_EFFORT": "xhigh"
      }
    }
  }
}
```

#### 配置示例 3：从源码安装

```json
{
  "mcpServers": {
    "codex": {
      "command": "node",
      "args": ["/absolute/path/to/codex-mcp-server/dist/index.js"],
      "env": {
        "CODEX_API_BASE_URL": "https://your-codex-service.com/v1",
        "CODEX_API_KEY": "your-api-key-here",
        "CODEX_MODEL": "gpt-5.3-codex",
        "CODEX_REASONING_EFFORT": "xhigh"
      }
    }
  }
}
```

**注意**: 将配置中的 API URL 和 Key 替换为你的实际值。

### 重启 Claude Code

配置完成后，重启 Claude Code 使配置生效。

## ✅ 验证安装

### 1. 列出 MCP 工具

在 Claude Code 中输入：

```
Claude, list all available MCP tools
```

应该能看到：

- `codex_generate`
- `codex_edit`
- `codex_explain`
- `codex_fix`
- `codex_refactor`

### 2. 测试工具调用

```
Claude, use codex_generate to create a Python function that implements binary search
```

## 📚 可用工具

| 工具             | 用途         | 示例            |
| ---------------- | ------------ | --------------- |
| `codex_generate` | 生成新代码   | 创建 React 组件 |
| `codex_edit`     | 编辑现有代码 | 添加错误处理    |
| `codex_explain`  | 解释代码逻辑 | 分析算法复杂度  |
| `codex_fix`      | 修复 bug     | 解决内存泄漏    |
| `codex_refactor` | 重构代码     | 简化嵌套逻辑    |

## 🎨 推理强度配置

| 等级     | 适用场景           | 速度 | 质量 |
| -------- | ------------------ | ---- | ---- |
| `xhigh`  | 复杂算法、架构设计 | 最慢 | 最高 |
| `high`   | 一般复杂任务       | 慢   | 高   |
| `medium` | 日常开发           | 中等 | 中等 |
| `low`    | 简单任务           | 快   | 基础 |

## 📖 详细文档

- **使用示例**: 查看 `EXAMPLES.md`
- **Claude Code 集成**: 查看 `CLAUDE_CODE_CONFIG.md`
- **GPT-5.3-Codex 配置**: 查看 `GPT-5.3-CODEX-CONFIG.md`
- **完整文档**: 查看 `README.md`

## 🔧 故障排查

### 问题 1: "Cannot find module"

```bash
cd "C:\Users\31444\Desktop\Codex MCP"
npm run build
```

### 问题 2: "CODEX_API_BASE_URL must be set"

检查 `.env` 文件或 Claude Code 配置中的环境变量。

### 问题 3: Claude Code 看不到工具

1. 检查配置文件路径是否正确
2. 重启 Claude Code
3. 查看 Claude Code 日志

## 💡 使用建议

1. **默认使用 `xhigh` 推理强度**，获得最佳代码质量
2. **让 Claude 决定何时调用 Codex**，不要手动强制
3. **复杂任务才用 Codex**，简单任务 Claude 自己就能搞定
4. **监控成本**，`xhigh` 推理会消耗更多 tokens

## 🎉 完成！

你的 Codex MCP Server 已经完全配置好了！

**架构**：

```
Claude Code (主控)
    ↓
MCP Server (协议转换)
    ↓
你的 Codex 服务 (/v1/responses)
```

**职责分离**：

- **Claude Code**: 理解需求、文件操作、命令执行、工具编排
- **Codex**: 代码生成、编辑、分析（最强推理能力）

享受 Claude + Codex 的强大组合！🚀
