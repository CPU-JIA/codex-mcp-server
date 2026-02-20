# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-20

### Added

- Initial release of Codex MCP Server
- Support for GPT-5.3-Codex model with reasoning effort control
- 5 professional tools:
  - `codex_generate`: Generate new code from natural language
  - `codex_edit`: Modify existing code based on instructions
  - `codex_explain`: Explain code logic and complexity
  - `codex_fix`: Fix bugs based on error messages
  - `codex_refactor`: Improve code quality and structure
- Native `/v1/responses` API support
- Configurable reasoning effort levels (xhigh, high, medium, low)
- Streaming response support (SSE)
- Complete TypeScript type definitions
- Error handling, timeout, and retry mechanisms
- Comprehensive documentation:
  - README.md
  - QUICKSTART.md
  - CLAUDE_CODE_CONFIG.md
  - EXAMPLES.md
  - GPT-5.3-CODEX-CONFIG.md
  - PUBLISHING.md

### Features

- Environment variable configuration
- Claude Code CLI integration (`claude mcp add` support)
- Manual configuration file support
- Cross-platform support (Windows, Linux, macOS)
- Production-ready error handling

[1.0.0]: https://github.com/CPU-JIA/codex-mcp-server/releases/tag/v1.0.0
