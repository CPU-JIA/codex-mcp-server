# GPT-5.3-Codex 配置指南

## 模型概述

**GPT-5.3-Codex** 是 OpenAI 最新的 agentic 编码模型（2026年2月发布），结合了：

- GPT-5.2-Codex 的前沿编码能力
- GPT-5.2 的推理和专业知识能力
- 比前代快 25%

## 可用模型

| 模型                  | 特点                     | 适用场景             |
| --------------------- | ------------------------ | -------------------- |
| `gpt-5.3-codex`       | 最强能力，平衡速度和质量 | 通用编码任务（推荐） |
| `gpt-5.3-codex-spark` | 超快速（>1000 tokens/s） | 实时编码、快速迭代   |
| `gpt-5.2-codex`       | 稳定版本                 | 生产环境             |

## 推理强度配置

GPT-5.3-Codex 支持 `reasoning.effort` 参数，控制推理深度：

### 推理等级

| 等级      | 速度 | 质量   | 适用场景                     |
| --------- | ---- | ------ | ---------------------------- |
| `xhigh`   | 最慢 | 最高   | 复杂算法、架构设计、安全审查 |
| `high`    | 慢   | 高     | 一般复杂任务、重构、优化     |
| `medium`  | 中等 | 中等   | 平衡场景、日常开发           |
| `low`     | 快   | 基础   | 简单任务、代码补全           |
| `minimal` | 很快 | 最低   | 极简任务                     |
| `none`    | 最快 | 无推理 | 纯文本生成                   |

### 推荐配置

```env
# 复杂任务（架构设计、算法优化）
CODEX_REASONING_EFFORT=xhigh

# 一般开发任务
CODEX_REASONING_EFFORT=high

# 快速迭代
CODEX_REASONING_EFFORT=medium

# 代码补全
CODEX_REASONING_EFFORT=low
```

## API 请求格式

### 基础请求

```bash
curl -X POST https://your-codex-service.com/v1/responses \
  -H "Authorization: Bearer $CODEX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.3-codex",
    "input": [
      {
        "role": "user",
        "content": "实现一个高性能的 LRU 缓存"
      }
    ],
    "max_output_tokens": 4096
  }'
```

### 带推理强度的请求

```bash
curl -X POST https://your-codex-service.com/v1/responses \
  -H "Authorization: Bearer $CODEX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.3-codex",
    "reasoning": {
      "effort": "xhigh"
    },
    "input": [
      {
        "role": "user",
        "content": "设计一个分布式锁的实现方案"
      }
    ],
    "max_output_tokens": 4096
  }'
```

### 流式响应

```bash
curl -X POST https://your-codex-service.com/v1/responses \
  -H "Authorization: Bearer $CODEX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.3-codex",
    "reasoning": {
      "effort": "high"
    },
    "input": [
      {
        "role": "user",
        "content": "重构这段代码"
      }
    ],
    "stream": true
  }'
```

## MCP Server 配置

### 完整配置示例

```json
{
  "mcpServers": {
    "codex": {
      "command": "node",
      "args": ["C:\\Users\\31444\\Desktop\\Codex MCP\\dist\\index.js"],
      "env": {
        "CODEX_API_BASE_URL": "https://your-codex-service.com/v1",
        "CODEX_API_KEY": "your-api-key-here",
        "CODEX_MODEL": "gpt-5.3-codex",
        "CODEX_REASONING_EFFORT": "xhigh",
        "CODEX_TIMEOUT": "120000",
        "CODEX_MAX_TOKENS": "8192"
      }
    }
  }
}
```

### 多配置方案

针对不同任务使用不同配置：

```json
{
  "mcpServers": {
    "codex-xhigh": {
      "command": "node",
      "args": ["C:\\Users\\31444\\Desktop\\Codex MCP\\dist\\index.js"],
      "env": {
        "CODEX_MODEL": "gpt-5.3-codex",
        "CODEX_REASONING_EFFORT": "xhigh",
        "CODEX_TIMEOUT": "180000"
      }
    },
    "codex-fast": {
      "command": "node",
      "args": ["C:\\Users\\31444\\Desktop\\Codex MCP\\dist\\index.js"],
      "env": {
        "CODEX_MODEL": "gpt-5.3-codex-spark",
        "CODEX_REASONING_EFFORT": "low",
        "CODEX_TIMEOUT": "30000"
      }
    }
  }
}
```

## 性能优化建议

### 1. 根据任务选择推理强度

```
简单任务（typo、格式化）→ low/minimal
中等任务（功能实现）→ medium/high
复杂任务（架构设计）→ high/xhigh
```

### 2. 调整超时时间

```env
# xhigh 推理需要更长时间
CODEX_REASONING_EFFORT=xhigh
CODEX_TIMEOUT=180000  # 3分钟

# low 推理可以更短
CODEX_REASONING_EFFORT=low
CODEX_TIMEOUT=30000   # 30秒
```

### 3. 使用 Spark 模型加速

```env
# 实时编码场景
CODEX_MODEL=gpt-5.3-codex-spark
CODEX_REASONING_EFFORT=medium
```

## 使用场景示例

### 场景 1：复杂算法设计

```
配置: gpt-5.3-codex + xhigh
用途: 设计分布式系统、优化算法、安全审查
预期: 深度推理，高质量输出
```

### 场景 2：日常开发

```
配置: gpt-5.3-codex + high
用途: 功能实现、代码重构、bug 修复
预期: 平衡速度和质量
```

### 场景 3：快速迭代

```
配置: gpt-5.3-codex-spark + medium
用途: 实时编码、快速原型、代码补全
预期: 极快响应，基本质量
```

## 成本优化

### 推理 Token 消耗

推理强度越高，消耗的 reasoning tokens 越多：

```
xhigh: 大量推理 tokens（高成本）
high: 较多推理 tokens
medium: 中等推理 tokens
low: 少量推理 tokens
minimal/none: 无推理 tokens（低成本）
```

### 建议策略

1. **默认使用 `medium`**，平衡成本和质量
2. **复杂任务才用 `xhigh`**，避免过度消耗
3. **简单任务用 `low`**，节省成本
4. **批量任务考虑 `high`**，一次性解决问题

## 兼容性说明

### 支持的推理等级

| 模型                | none | minimal | low | medium | high | xhigh |
| ------------------- | ---- | ------- | --- | ------ | ---- | ----- |
| gpt-5.3-codex       | ✅   | ✅      | ✅  | ✅     | ✅   | ✅    |
| gpt-5.3-codex-spark | ✅   | ✅      | ✅  | ✅     | ❌   | ❌    |
| gpt-5.2-codex       | ✅   | ✅      | ✅  | ✅     | ✅   | ✅    |

### API 版本

- **Responses API**: `/v1/responses`（推荐）
- **Chat Completions API**: `/v1/chat/completions`（已弃用，2026年2月移除）

## 故障排查

### 问题 1: "reasoning.effort not supported"

**原因**: 模型不支持该推理等级

**解决**:

- 检查模型是否支持（参考兼容性表）
- 降低推理等级或移除 `reasoning` 参数

### 问题 2: 请求超时

**原因**: `xhigh` 推理需要更长时间

**解决**:

```env
CODEX_REASONING_EFFORT=xhigh
CODEX_TIMEOUT=180000  # 增加到3分钟
```

### 问题 3: 成本过高

**原因**: 过度使用 `xhigh` 推理

**解决**:

- 降低默认推理等级到 `medium` 或 `high`
- 只在必要时使用 `xhigh`

## 最佳实践

1. ✅ **默认 `medium`**，复杂任务才用 `xhigh`
2. ✅ **根据任务类型动态调整**推理强度
3. ✅ **监控成本**，避免过度使用高推理等级
4. ✅ **使用 Spark 模型**加速实时编码
5. ✅ **设置合理的超时时间**，避免长时间等待

---

**GPT-5.3-Codex 是目前最强的编码模型，合理配置推理强度可以获得最佳效果！** 🚀
