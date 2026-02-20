# Claude Code 集成配置指南

## 配置文件位置

- **Windows**: `%APPDATA%\Claude\mcp.json`
- **Linux/Mac**: `~/.config/claude/mcp.json`

## 快速配置

### 方式 A：使用命令行（推荐 ⭐⭐⭐）

```bash
# 在项目目录运行
cd /path/to/codex-mcp-server

# 添加到 Claude Code（全局配置）
claude mcp add --scope user codex -- node /absolute/path/to/codex-mcp-server/dist/index.js

# Windows 示例
claude mcp add --scope user codex -- node "C:\path\to\codex-mcp-server\dist\index.js"

# Linux/Mac 示例
claude mcp add --scope user codex -- node /home/user/codex-mcp-server/dist/index.js
```

### 方式 B：手动编辑配置文件

编辑配置文件（见上方路径）：

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
        "CODEX_REASONING_EFFORT": "xhigh",
        "CODEX_TIMEOUT": "60000",
        "CODEX_MAX_TOKENS": "4096"
      }
    }
  }
}
```

**注意**:

- 将 `/absolute/path/to/codex-mcp-server` 替换为实际安装路径
- Windows 路径使用双反斜杠 `\\` 或正斜杠 `/`
- Linux/Mac 路径使用正斜杠 `/`

## 配置说明

### 必需字段

- `command`: Node.js 可执行文件路径（通常是 `node`）
- `args`: MCP Server 入口文件路径（使用双反斜杠 `\\` 或正斜杠 `/`）
- `env.CODEX_API_BASE_URL`: Codex API 基础 URL
- `env.CODEX_API_KEY`: Codex API 密钥

### 可选字段

- `env.CODEX_MODEL`: 模型名称（默认：`gpt-5.3-codex`）
  - `gpt-5.3-codex`: 最强模型，推荐使用
  - `gpt-5.3-codex-spark`: 超快速模型，实时编码
  - `gpt-5.2-codex`: 稳定版本
- `env.CODEX_REASONING_EFFORT`: 推理强度（默认：不设置）
  - `xhigh`: 最强推理，适合复杂算法和架构设计
  - `high`: 高推理，适合一般复杂任务
  - `medium`: 中等推理，平衡速度和质量
  - `low`: 快速响应，简单任务
  - `minimal` / `none`: 最快速度
- `env.CODEX_TIMEOUT`: 请求超时时间（毫秒，默认：60000）
- `env.CODEX_MAX_TOKENS`: 最大输出 token 数（默认：4096）

## 多 MCP Server 配置

如果你已经有其他 MCP Server，只需添加 `codex` 配置：

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/allowed/files"
      ]
    },
    "codex": {
      "command": "node",
      "args": ["/absolute/path/to/codex-mcp-server/dist/index.js"],
      "env": {
        "CODEX_API_BASE_URL": "https://your-codex-service.com/v1",
        "CODEX_API_KEY": "your-api-key-here"
      }
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your-brave-api-key"
      }
    }
  }
}
```

## 验证配置

### 1. 检查配置文件语法

确保 JSON 格式正确（无多余逗号、括号匹配）。

### 2. 重启 Claude Code

配置修改后必须重启 Claude Code 才能生效。

### 3. 测试工具可用性

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

### 4. 测试工具调用

```
Claude, use codex_generate to create a simple hello world function in Python
```

## 常见问题

### Q1: "Cannot find module"

**原因**: `args` 路径不正确或项目未构建。

**解决**:

```bash
cd /path/to/codex-mcp-server
npm run build
```

### Q2: "CODEX_API_BASE_URL must be set"

**原因**: 环境变量未正确传递。

**解决**: 检查 `env` 字段是否正确配置。

### Q3: Claude Code 无法启动 MCP Server

**原因**: Node.js 不在 PATH 中。

**解决**: 使用 Node.js 完整路径：

```json
{
  "command": "C:\\Program Files\\nodejs\\node.exe",
  "args": ["/absolute/path/to/codex-mcp-server/dist/index.js"]
}
```

### Q4: 工具调用失败

**原因**: Codex API 端点不可达或 API Key 无效。

**解决**:

1. 测试 API 端点：
   ```bash
   curl -X POST https://your-codex-service.com/v1/responses \
     -H "Authorization: Bearer your-api-key" \
     -H "Content-Type: application/json" \
     -d '{"model":"gpt-5.3-codex","input":[{"role":"user","content":"test"}]}'
   ```
2. 检查 API Key 是否有效
3. 确认网络连接正常

## 高级配置

### 使用 .env 文件（推荐）

如果不想在配置文件中暴露 API Key，可以使用 `.env` 文件：

1. 在项目根目录创建 `.env`：

   ```env
   CODEX_API_BASE_URL=https://your-codex-service.com/v1
   CODEX_API_KEY=your-api-key-here
   CODEX_MODEL=gpt-5.1-codex-max
   ```

2. 修改 Claude Code 配置：

   ```json
   {
     "mcpServers": {
       "codex": {
         "command": "node",
         "args": ["/absolute/path/to/codex-mcp-server/dist/index.js"],
         "cwd": "/absolute/path/to/codex-mcp-server"
       }
     }
   }
   ```

3. 修改 `src/index.ts` 加载 `.env`：
   ```typescript
   import { config } from "dotenv";
   config();
   ```

### 多环境配置

开发环境和生产环境使用不同配置：

```json
{
  "mcpServers": {
    "codex-dev": {
      "command": "node",
      "args": ["/absolute/path/to/codex-mcp-server/dist/index.js"],
      "env": {
        "CODEX_API_BASE_URL": "http://localhost:8000/v1",
        "CODEX_API_KEY": "dev-key"
      }
    },
    "codex-prod": {
      "command": "node",
      "args": ["/absolute/path/to/codex-mcp-server/dist/index.js"],
      "env": {
        "CODEX_API_BASE_URL": "https://prod-codex.com/v1",
        "CODEX_API_KEY": "prod-key"
      }
    }
  }
}
```

## 日志调试

如需查看 MCP Server 日志，修改 `src/index.ts`：

```typescript
async function main() {
  const transport = new StdioServerTransport();

  // 启用详细日志
  console.error("Codex MCP Server starting...");
  console.error("Config:", {
    baseURL: CODEX_API_BASE_URL,
    model: CODEX_MODEL,
  });

  await server.connect(transport);
  console.error("Codex MCP Server running on stdio");
}
```

日志会输出到 Claude Code 的错误流中。

---

**配置完成后，重启 Claude Code 即可使用！** 🎉
