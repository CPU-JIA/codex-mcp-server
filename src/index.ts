#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { CodexClient } from "./codex-client.js";
import { tools } from "./tools.js";
import type { ReasoningEffort, JsonSchemaFormat } from "./codex-client.js";

// --- 配置 ---

const CODEX_API_BASE_URL = process.env.CODEX_API_BASE_URL;
const CODEX_API_KEY = process.env.CODEX_API_KEY;
const CODEX_MODEL = process.env.CODEX_MODEL || "gpt-5.3-codex";
const CODEX_REASONING_EFFORT = (process.env.CODEX_REASONING_EFFORT ||
  "high") as ReasoningEffort;

if (!CODEX_API_BASE_URL || !CODEX_API_KEY) {
  console.error("Error: CODEX_API_BASE_URL and CODEX_API_KEY must be set");
  process.exit(1);
}

const codexClient = new CodexClient({
  baseURL: CODEX_API_BASE_URL,
  apiKey: CODEX_API_KEY,
  model: CODEX_MODEL,
  timeout: parseInt(process.env.CODEX_TIMEOUT || "120000"),
  maxTokens: parseInt(process.env.CODEX_MAX_TOKENS || "16384"),
  reasoningEffort: CODEX_REASONING_EFFORT,
});

// --- JSON Schemas（强制结构化输出） ---

const GENERATE_SCHEMA: JsonSchemaFormat = {
  name: "generate_result",
  schema: {
    type: "object",
    properties: {
      code: { type: "string", description: "Generated code" },
      language: { type: "string", description: "Programming language" },
      explanation: {
        type: "string",
        description: "Brief explanation of approach and key decisions",
      },
      dependencies: {
        type: "array",
        items: { type: "string" },
        description: "Required packages or imports",
      },
    },
    required: ["code", "language", "explanation", "dependencies"],
    additionalProperties: false,
  },
};

const REVIEW_SCHEMA: JsonSchemaFormat = {
  name: "review_result",
  schema: {
    type: "object",
    properties: {
      findings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            severity: {
              type: "string",
              enum: ["critical", "high", "medium", "low", "info"],
            },
            category: {
              type: "string",
              enum: [
                "security",
                "performance",
                "best-practice",
                "bug",
                "maintainability",
              ],
            },
            location: {
              type: "string",
              description: "Line number or code section",
            },
            issue: {
              type: "string",
              description: "Description of the problem",
            },
            suggestion: {
              type: "string",
              description: "Concrete fix or improvement",
            },
          },
          required: ["severity", "category", "location", "issue", "suggestion"],
          additionalProperties: false,
        },
      },
      summary: { type: "string", description: "Overall assessment" },
      score: { type: "number", description: "Quality score 0-100" },
    },
    required: ["findings", "summary", "score"],
    additionalProperties: false,
  },
};

const TEST_SCHEMA: JsonSchemaFormat = {
  name: "test_result",
  schema: {
    type: "object",
    properties: {
      test_code: {
        type: "string",
        description: "Complete test file content",
      },
      language: { type: "string", description: "Programming language" },
      framework: { type: "string", description: "Test framework used" },
      test_cases: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Test name" },
            description: {
              type: "string",
              description: "What this test verifies",
            },
            type: {
              type: "string",
              enum: ["unit", "integration", "edge-case", "error-handling"],
            },
          },
          required: ["name", "description", "type"],
          additionalProperties: false,
        },
      },
      coverage_notes: {
        type: "string",
        description: "What is covered and gaps remaining",
      },
    },
    required: [
      "test_code",
      "language",
      "framework",
      "test_cases",
      "coverage_notes",
    ],
    additionalProperties: false,
  },
};

// --- Developer 指令（per-tool） ---

const INSTRUCTIONS = {
  generate: [
    "You are a senior software engineer. Generate production-quality code.",
    "",
    "Rules:",
    "- Write complete, runnable code — no placeholders, no TODOs",
    "- Include necessary imports and type definitions",
    "- Follow language-specific conventions and idioms",
    "- If project context is provided, follow its conventions strictly",
    "- Optimize for readability first, performance second",
  ].join("\n"),

  review: [
    "You are a security-focused code reviewer. Provide independent, critical analysis.",
    "",
    "Rules:",
    "- Reference exact locations in the code (line numbers or function names)",
    "- Prioritize: critical > high > medium > low > info",
    "- For each finding, provide a concrete, actionable fix",
    "- Score fairly: 90+ excellent, 70-89 good, 50-69 needs work, <50 concerning",
    "- Be honest — don't inflate scores. Empty findings array is fine for clean code",
  ].join("\n"),

  test: [
    "You are a testing expert. Write comprehensive test suites that catch real bugs.",
    "",
    "Rules:",
    "- Generate a complete, runnable test file",
    "- Cover: happy path, edge cases, error handling, boundary conditions",
    "- Use the specified framework's idioms and best practices",
    "- Include descriptive test names explaining expected behavior",
    "- Mock external dependencies appropriately",
    "- Think about what would break in production and test that",
  ].join("\n"),
};

// --- 输入构建 ---

function buildInput(sections: Record<string, string | undefined>): string {
  const parts: string[] = [];
  for (const [label, content] of Object.entries(sections)) {
    if (content?.trim()) {
      parts.push(`## ${label}\n${content.trim()}`);
    }
  }
  return parts.join("\n\n");
}

// --- 安全 JSON 解析（带 fallback） ---

function safeJsonParse(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    // API 可能不支持 text.format，返回了非 JSON
    return null;
  }
}

// --- 格式化输出 ---

interface GenerateResult {
  code: string;
  language: string;
  explanation: string;
  dependencies: string[];
}

interface ReviewFinding {
  severity: string;
  category: string;
  location: string;
  issue: string;
  suggestion: string;
}

interface ReviewResult {
  findings: ReviewFinding[];
  summary: string;
  score: number;
}

interface TestCase {
  name: string;
  description: string;
  type: string;
}

interface TestResult {
  test_code: string;
  language: string;
  framework: string;
  test_cases: TestCase[];
  coverage_notes: string;
}

function formatGenerateOutput(parsed: GenerateResult): string {
  let text = `\`\`\`${parsed.language}\n${parsed.code}\n\`\`\``;
  text += `\n\n**Explanation:** ${parsed.explanation}`;
  if (parsed.dependencies.length > 0) {
    text += `\n\n**Dependencies:** ${parsed.dependencies.join(", ")}`;
  }
  return text;
}

function formatReviewOutput(parsed: ReviewResult): string {
  const findings = parsed.findings
    .map(
      (f, i) =>
        `${i + 1}. **[${f.severity.toUpperCase()}]** ${f.category} — \`${f.location}\`\n   Issue: ${f.issue}\n   Fix: ${f.suggestion}`,
    )
    .join("\n\n");

  return `**Score: ${parsed.score}/100**\n\n${parsed.summary}\n\n---\n\n${findings || "No issues found."}`;
}

function formatTestOutput(parsed: TestResult): string {
  const cases = parsed.test_cases
    .map((tc) => `- [${tc.type}] **${tc.name}**: ${tc.description}`)
    .join("\n");

  return `\`\`\`${parsed.language}\n${parsed.test_code}\n\`\`\`\n\n**Framework:** ${parsed.framework}\n**Test Cases (${parsed.test_cases.length}):**\n${cases}\n\n**Coverage:** ${parsed.coverage_notes}`;
}

// --- MCP Server ---

const server = new Server(
  { name: "codex-mcp-server", version: "2.0.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "codex_generate": {
        const {
          prompt,
          language,
          project_context,
          files,
          conversation_context,
        } = args as {
          prompt: string;
          language?: string;
          project_context?: string;
          files?: string;
          conversation_context?: string;
        };

        const input = buildInput({
          Task: prompt,
          Language: language,
          "Project Context": project_context,
          "Reference Files": files,
          "Conversation Context": conversation_context,
        });

        const raw = await codexClient.request({
          instructions: INSTRUCTIONS.generate,
          input,
          jsonSchema: GENERATE_SCHEMA,
        });

        const parsed = safeJsonParse(raw);
        if (parsed && typeof parsed.code === "string") {
          return {
            content: [
              {
                type: "text" as const,
                text: formatGenerateOutput(parsed as unknown as GenerateResult),
              },
            ],
          };
        }

        // Fallback：API 不支持结构化输出时直接返回原文
        return { content: [{ type: "text" as const, text: raw }] };
      }

      case "codex_review": {
        const { code, language, focus, project_context, conversation_context } =
          args as {
            code: string;
            language?: string;
            focus?: string;
            project_context?: string;
            conversation_context?: string;
          };

        const input = buildInput({
          "Code to Review": `\`\`\`${language ?? ""}\n${code}\n\`\`\``,
          Language: language,
          "Focus Area": focus ?? "all",
          "Project Context": project_context,
          "Review Context": conversation_context,
        });

        const raw = await codexClient.request({
          instructions: INSTRUCTIONS.review,
          input,
          jsonSchema: REVIEW_SCHEMA,
          reasoningEffort: "high",
        });

        const parsed = safeJsonParse(raw);
        if (parsed && Array.isArray(parsed.findings)) {
          return {
            content: [
              {
                type: "text" as const,
                text: formatReviewOutput(parsed as unknown as ReviewResult),
              },
            ],
          };
        }

        return { content: [{ type: "text" as const, text: raw }] };
      }

      case "codex_test": {
        const {
          code,
          language,
          framework,
          project_context,
          conversation_context,
        } = args as {
          code: string;
          language?: string;
          framework?: string;
          project_context?: string;
          conversation_context?: string;
        };

        const input = buildInput({
          "Code to Test": `\`\`\`${language ?? ""}\n${code}\n\`\`\``,
          Language: language,
          "Test Framework": framework,
          "Project Context": project_context,
          Context: conversation_context,
        });

        const raw = await codexClient.request({
          instructions: INSTRUCTIONS.test,
          input,
          jsonSchema: TEST_SCHEMA,
          reasoningEffort: "high",
        });

        const parsed = safeJsonParse(raw);
        if (parsed && typeof parsed.test_code === "string") {
          return {
            content: [
              {
                type: "text" as const,
                text: formatTestOutput(parsed as unknown as TestResult),
              },
            ],
          };
        }

        return { content: [{ type: "text" as const, text: raw }] };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text" as const, text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
});

// --- 启动 ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Codex MCP Server v2.0.0 running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
