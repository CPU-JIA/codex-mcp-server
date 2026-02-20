# Codex MCP Server

[![npm version](https://badge.fury.io/js/%40cpujia%2Fcodex-mcp-server.svg)](https://www.npmjs.com/package/@cpujia/codex-mcp-server)
[![npm downloads](https://img.shields.io/npm/dm/@cpujia/codex-mcp-server.svg)](https://www.npmjs.com/package/@cpujia/codex-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![GitHub stars](https://img.shields.io/github/stars/CPU-JIA/codex-mcp-server.svg)](https://github.com/CPU-JIA/codex-mcp-server/stargazers)

MCP Server for integrating OpenAI Codex `/v1/responses` API with Claude Code. Enables Claude Code to leverage GPT-5.3-Codex's powerful code generation capabilities.

## ✨ Features

- 🚀 **GPT-5.3-Codex Support**: Latest and most powerful Codex model
- 🧠 **Reasoning Control**: Configurable reasoning effort (xhigh, high, medium, low)
- 🛠️ **5 Professional Tools**: Generate, edit, explain, fix, and refactor code
- 📡 **Native `/v1/responses` API**: Full protocol support with streaming
- 🔒 **Type-Safe**: Complete TypeScript type definitions
- ⚡ **Production-Ready**: Error handling, timeouts, and retry mechanisms

## 📦 Installation

### Option A: Install via npm (Recommended)

```bash
# Global installation
npm install -g @cpujia/codex-mcp-server

# Add to Claude Code
claude mcp add --scope user codex -- codex-mcp
```

### Option B: Install from source

```bash
# Clone the repository
git clone https://github.com/CPU-JIA/codex-mcp-server.git
cd codex-mcp-server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Codex API credentials

# Build
npm run build

# Add to Claude Code
claude mcp add --scope user codex -- node /absolute/path/to/codex-mcp-server/dist/index.js
```

### Option C: Use with npx (No installation required)

```bash
# Add to Claude Code using npx
claude mcp add --scope user codex -- npx @cpujia/codex-mcp-server
```

### Detailed Installation

See [QUICKSTART.md](QUICKSTART.md) for step-by-step instructions.

## 🔧 Configuration

### Environment Variables

```env
CODEX_API_BASE_URL=https://your-codex-service.com/v1
CODEX_API_KEY=your-api-key-here
CODEX_MODEL=gpt-5.3-codex
CODEX_REASONING_EFFORT=xhigh
CODEX_TIMEOUT=60000
CODEX_MAX_TOKENS=4096
```

### Claude Code Integration

**Option A: Command Line (Recommended)**

```bash
claude mcp add --scope user codex -- node /path/to/codex-mcp-server/dist/index.js
```

**Option B: Manual Configuration**

Edit `%APPDATA%\Claude\mcp.json` (Windows) or `~/.config/claude/mcp.json` (Linux/Mac):

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

See [CLAUDE_CODE_CONFIG.md](CLAUDE_CODE_CONFIG.md) for detailed configuration options.

## 🛠️ Available Tools

| Tool             | Description                                | Use Case                                 |
| ---------------- | ------------------------------------------ | ---------------------------------------- |
| `codex_generate` | Generate new code from natural language    | Create functions, components, algorithms |
| `codex_edit`     | Modify existing code based on instructions | Add features, refactor, optimize         |
| `codex_explain`  | Explain code logic and complexity          | Understand algorithms, review code       |
| `codex_fix`      | Fix bugs based on error messages           | Debug, resolve issues                    |
| `codex_refactor` | Improve code quality and structure         | Simplify logic, enhance readability      |

### Example Usage

```
Claude, use codex_generate to create a TypeScript function that implements a binary search tree
```

See [EXAMPLES.md](EXAMPLES.md) for more detailed examples.

## 🎯 Reasoning Effort Levels

| Level    | Speed   | Quality | Best For                                |
| -------- | ------- | ------- | --------------------------------------- |
| `xhigh`  | Slowest | Highest | Complex algorithms, architecture design |
| `high`   | Slow    | High    | General complex tasks, refactoring      |
| `medium` | Medium  | Medium  | Daily development, balanced use         |
| `low`    | Fast    | Basic   | Simple tasks, code completion           |

See [GPT-5.3-CODEX-CONFIG.md](GPT-5.3-CODEX-CONFIG.md) for detailed reasoning configuration.

## 📚 Documentation

- [QUICKSTART.md](QUICKSTART.md) - Quick installation guide
- [EXAMPLES.md](EXAMPLES.md) - Detailed usage examples
- [CLAUDE_CODE_CONFIG.md](CLAUDE_CODE_CONFIG.md) - Claude Code integration
- [GPT-5.3-CODEX-CONFIG.md](GPT-5.3-CODEX-CONFIG.md) - GPT-5.3-Codex configuration

## 🏗️ Architecture

```
Claude Code (Orchestrator)
    ↓
MCP Server (Protocol Bridge)
    ↓
Codex API (/v1/responses)
```

**Separation of Concerns:**

- **Claude Code**: Requirement understanding, file operations, command execution, tool orchestration
- **Codex**: Code generation, editing, analysis (with powerful reasoning)

## 🔍 Troubleshooting

### "Cannot find module"

```bash
cd /path/to/codex-mcp-server
npm run build
```

### "CODEX_API_BASE_URL must be set"

Check your `.env` file or Claude Code configuration `env` fields.

### Claude Code doesn't see the tools

1. Verify the configuration file path is correct
2. Restart Claude Code
3. Check Claude Code logs for errors

### API call failures

1. Test your Codex API endpoint:
   ```bash
   curl -X POST https://your-codex-service.com/v1/responses \
     -H "Authorization: Bearer your-api-key" \
     -H "Content-Type: application/json" \
     -d '{"model":"gpt-5.3-codex","input":[{"role":"user","content":"test"}]}'
   ```
2. Verify API key is valid
3. Check network connectivity

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Anthropic](https://www.anthropic.com/) for Claude Code and MCP
- [OpenAI](https://openai.com/) for GPT-5.3-Codex
- [Model Context Protocol](https://modelcontextprotocol.io/) community

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/CPU-JIA/codex-mcp-server/issues)
- **Documentation**: See docs in this repository
- **Community**: [MCP Discord](https://discord.gg/modelcontextprotocol)

---

**Enjoy the powerful combination of Claude + Codex!** 🚀
