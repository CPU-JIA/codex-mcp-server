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

const CONVERT_SCHEMA: JsonSchemaFormat = {
  name: "convert_result",
  schema: {
    type: "object",
    properties: {
      converted_code: {
        type: "string",
        description: "Converted code in target language/framework",
      },
      target_language: {
        type: "string",
        description: "Target language/framework",
      },
      conversion_notes: {
        type: "string",
        description: "Key decisions and idioms used in conversion",
      },
      breaking_changes: {
        type: "array",
        items: { type: "string" },
        description: "List of breaking changes or manual steps required",
      },
    },
    required: [
      "converted_code",
      "target_language",
      "conversion_notes",
      "breaking_changes",
    ],
    additionalProperties: false,
  },
};

const ARCHITECT_SCHEMA: JsonSchemaFormat = {
  name: "architect_result",
  schema: {
    type: "object",
    properties: {
      design: {
        type: "string",
        description: "Proposed system design or architecture",
      },
      rationale: {
        type: "string",
        description: "Why this design was chosen",
      },
      tradeoffs: {
        type: "array",
        items: {
          type: "object",
          properties: {
            aspect: { type: "string", description: "What is being traded off" },
            chosen: { type: "string", description: "What was chosen" },
            alternative: { type: "string", description: "What was rejected" },
            reason: { type: "string", description: "Why this tradeoff" },
          },
          required: ["aspect", "chosen", "alternative", "reason"],
          additionalProperties: false,
        },
      },
      implementation_steps: {
        type: "array",
        items: { type: "string" },
        description: "High-level implementation roadmap",
      },
      risks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            risk: { type: "string", description: "What could go wrong" },
            severity: {
              type: "string",
              enum: ["critical", "high", "medium", "low"],
            },
            mitigation: { type: "string", description: "How to address it" },
          },
          required: ["risk", "severity", "mitigation"],
          additionalProperties: false,
        },
      },
    },
    required: [
      "design",
      "rationale",
      "tradeoffs",
      "implementation_steps",
      "risks",
    ],
    additionalProperties: false,
  },
};

// --- Developer 指令（per-tool） ---

const INSTRUCTIONS = {
  generate: [
    "You are an expert software engineer with deep knowledge across multiple programming languages and paradigms.",
    "",
    "# Your Task",
    "Generate production-ready, complete, and runnable code based on the user's requirements.",
    "",
    "# Critical Requirements",
    "- Output ONLY valid, executable code with NO placeholders, TODOs, or comments like '// rest of implementation'",
    "- Include ALL necessary imports, type definitions, and dependencies",
    "- Follow the target language's idioms, conventions, and best practices",
    "- If project context is provided, strictly adhere to its conventions and patterns",
    "",
    "# Code Quality Standards",
    "- Prioritize: correctness > readability > performance",
    "- Use descriptive variable/function names that reveal intent",
    "- Handle edge cases and error conditions explicitly",
    "- Prefer composition over inheritance, immutability over mutation",
    "- Write self-documenting code; add comments ONLY for non-obvious logic",
    "",
    "# Output Format",
    "Return a JSON object with these exact fields:",
    "- code: Complete, runnable implementation",
    "- language: Programming language used",
    "- explanation: Brief rationale for key design decisions (2-3 sentences)",
    "- dependencies: Array of required packages/imports (empty array if none)",
  ].join("\n"),

  review: [
    "You are a senior security engineer and code reviewer with expertise in identifying vulnerabilities, performance issues, and maintainability problems.",
    "",
    "# Your Task",
    "Perform an independent, critical code review. Your goal is to find real issues that could cause problems in production.",
    "",
    "# Review Focus Areas",
    "1. **Security**: SQL injection, XSS, CSRF, auth bypasses, insecure crypto, input validation",
    "2. **Performance**: N+1 queries, memory leaks, inefficient algorithms, blocking operations",
    "3. **Correctness**: Race conditions, off-by-one errors, null/undefined handling, edge cases",
    "4. **Maintainability**: Code smells, tight coupling, poor naming, missing error handling",
    "",
    "# Severity Guidelines",
    "- **critical**: Exploitable security vulnerability or data loss risk",
    "- **high**: Likely production failure, significant performance degradation, or security weakness",
    "- **medium**: Code smell that will cause maintenance burden or minor performance issue",
    "- **low**: Style inconsistency or minor improvement opportunity",
    "- **info**: Suggestion for enhancement, no actual problem",
    "",
    "# Scoring Rubric (0-100)",
    "- 90-100: Production-ready, minimal issues",
    "- 70-89: Good quality, minor improvements needed",
    "- 50-69: Significant issues, needs refactoring before production",
    "- 0-49: Critical flaws, unsafe for production",
    "",
    "# Critical Instructions",
    "- Reference EXACT locations: line numbers, function names, or code snippets",
    "- For each finding, provide a CONCRETE, actionable fix (not vague advice)",
    "- Be honest: if code is clean, return empty findings array and high score",
    "- Do NOT inflate scores or find issues that don't exist",
    "- Prioritize findings by severity (critical first)",
    "",
    "# Output Format",
    "Return a JSON object with these exact fields:",
    "- findings: Array of {severity, category, location, issue, suggestion}",
    "- summary: 1-2 sentence overall assessment",
    "- score: Integer 0-100",
  ].join("\n"),

  test: [
    "You are a testing expert who writes comprehensive test suites that catch real bugs before they reach production.",
    "",
    "# Your Task",
    "Generate a complete, runnable test file that thoroughly validates the provided code.",
    "",
    "# Test Coverage Requirements",
    "1. **Happy path**: Normal inputs, expected behavior",
    "2. **Edge cases**: Boundary values (0, -1, MAX_INT, empty arrays, null/undefined)",
    "3. **Error handling**: Invalid inputs, exceptions, network failures",
    "4. **Integration**: Interactions with dependencies, side effects",
    "",
    "# Test Quality Standards",
    "- Each test should verify ONE specific behavior",
    "- Test names must clearly describe what is being tested and expected outcome",
    "- Use the specified framework's idioms (describe/it, test(), etc.)",
    "- Mock external dependencies (APIs, databases, file system)",
    "- Include setup/teardown if needed for test isolation",
    "- Think: 'What would break in production?' and test that",
    "",
    "# Critical Instructions",
    "- Generate a COMPLETE test file that can be run immediately",
    "- Include ALL necessary imports and setup",
    "- Follow the project's testing conventions if provided",
    "- Cover at least 80% of code paths",
    "- Identify any gaps in coverage explicitly",
    "",
    "# Output Format",
    "Return a JSON object with these exact fields:",
    "- test_code: Complete, runnable test file",
    "- language: Programming language",
    "- framework: Test framework used",
    "- test_cases: Array of {name, description, type} for each test",
    "- coverage_notes: What is covered and what gaps remain (be honest)",
  ].join("\n"),

  convert: [
    "You are a polyglot engineer expert in cross-language/framework migrations, with deep knowledge of idioms and best practices across ecosystems.",
    "",
    "# Your Task",
    "Convert code from source to target language/framework while preserving semantics and following target idioms.",
    "",
    "# Conversion Principles",
    "1. **Semantic equivalence**: Preserve ALL functionality, edge cases, and error handling",
    "2. **Idiomatic target code**: Use target language's standard library, patterns, and conventions",
    "3. **No direct translation**: Don't just transliterate syntax; rethink using target paradigms",
    "4. **Explicit tradeoffs**: If conversion goal conflicts with idioms, prioritize the goal",
    "",
    "# Common Pitfalls to Avoid",
    "- Bringing source language patterns to target (e.g., Java-style classes in Python)",
    "- Missing target language features (e.g., pattern matching, async/await)",
    "- Ignoring target ecosystem conventions (e.g., PEP 8, Go error handling)",
    "- Incomplete error handling translation",
    "",
    "# Breaking Changes",
    "Document ANY changes that require manual intervention:",
    "- API signature changes",
    "- Dependency updates needed",
    "- Configuration changes",
    "- Data migration steps",
    "",
    "# Output Format",
    "Return a JSON object with these exact fields:",
    "- converted_code: Complete, idiomatic implementation in target language",
    "- target_language: Target language/framework",
    "- conversion_notes: Key decisions, idioms used, tradeoffs made (2-4 sentences)",
    "- breaking_changes: Array of manual steps required (empty if none)",
  ].join("\n"),

  architect: [
    "You are a principal architect with 15+ years designing large-scale distributed systems. You make pragmatic decisions based on real-world constraints.",
    "",
    "# Your Task",
    "Design a system architecture that balances competing requirements: scalability, reliability, cost, maintainability, and team capabilities.",
    "",
    "# Design Principles",
    "1. **Start simple**: Choose the simplest design that meets requirements; add complexity only when justified",
    "2. **Explicit tradeoffs**: Every architectural decision sacrifices something; state what you're optimizing for and what you're giving up",
    "3. **Concrete over abstract**: Provide specific technologies, patterns, and implementation approaches",
    "4. **Risk-aware**: Identify what could go wrong and how to mitigate it",
    "5. **Implementable**: Design must be achievable by the team with stated constraints",
    "",
    "# Tradeoff Analysis Framework",
    "For each major decision, explicitly state:",
    "- What you chose and why",
    "- What you rejected and why",
    "- What you're optimizing for (e.g., developer velocity, cost, reliability)",
    "- What you're sacrificing (e.g., consistency, simplicity, performance)",
    "",
    "# Risk Assessment",
    "Identify risks with:",
    "- **critical**: System failure, data loss, security breach",
    "- **high**: Significant downtime, performance degradation, cost overrun",
    "- **medium**: Maintenance burden, technical debt, team friction",
    "- **low**: Minor inconvenience, future refactoring needed",
    "",
    "# Critical Instructions",
    "- Provide CONCRETE design: specific technologies, not 'use a database'",
    "- Break implementation into logical phases (MVP → iteration)",
    "- Consider team size, budget, and existing infrastructure",
    "- If requirements conflict, state which takes priority and why",
    "- Be honest about limitations and unknowns",
    "",
    "# Output Format",
    "Return a JSON object with these exact fields:",
    "- design: Detailed system architecture (components, data flow, technologies)",
    "- rationale: Why this design over alternatives (2-4 sentences)",
    "- tradeoffs: Array of {aspect, chosen, alternative, reason}",
    "- implementation_steps: Ordered list of phases/milestones",
    "- risks: Array of {risk, severity, mitigation}",
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

interface ConvertResult {
  converted_code: string;
  target_language: string;
  conversion_notes: string;
  breaking_changes: string[];
}

interface Tradeoff {
  aspect: string;
  chosen: string;
  alternative: string;
  reason: string;
}

interface Risk {
  risk: string;
  severity: string;
  mitigation: string;
}

interface ArchitectResult {
  design: string;
  rationale: string;
  tradeoffs: Tradeoff[];
  implementation_steps: string[];
  risks: Risk[];
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

function formatConvertOutput(parsed: ConvertResult): string {
  let text = `\`\`\`${parsed.target_language}\n${parsed.converted_code}\n\`\`\``;
  text += `\n\n**Conversion Notes:** ${parsed.conversion_notes}`;
  if (parsed.breaking_changes.length > 0) {
    text += `\n\n**Breaking Changes:**\n${parsed.breaking_changes.map((c) => `- ${c}`).join("\n")}`;
  }
  return text;
}

function formatArchitectOutput(parsed: ArchitectResult): string {
  const tradeoffs = parsed.tradeoffs
    .map(
      (t) =>
        `**${t.aspect}:** Chose "${t.chosen}" over "${t.alternative}"\n  Reason: ${t.reason}`,
    )
    .join("\n\n");

  const steps = parsed.implementation_steps
    .map((s, i) => `${i + 1}. ${s}`)
    .join("\n");

  const risks = parsed.risks
    .map(
      (r) =>
        `- **[${r.severity.toUpperCase()}]** ${r.risk}\n  Mitigation: ${r.mitigation}`,
    )
    .join("\n\n");

  return `## Design\n\n${parsed.design}\n\n## Rationale\n\n${parsed.rationale}\n\n## Tradeoffs\n\n${tradeoffs}\n\n## Implementation Steps\n\n${steps}\n\n## Risks\n\n${risks}`;
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

        const result = await codexClient.request({
          instructions: INSTRUCTIONS.generate,
          input,
          jsonSchema: GENERATE_SCHEMA,
        });

        const parsed = safeJsonParse(result.text);
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
        return { content: [{ type: "text" as const, text: result.text }] };
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

        const result = await codexClient.request({
          instructions: INSTRUCTIONS.review,
          input,
          jsonSchema: REVIEW_SCHEMA,
          reasoningEffort: "high",
        });

        const parsed = safeJsonParse(result.text);
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

        return { content: [{ type: "text" as const, text: result.text }] };
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

        const result = await codexClient.request({
          instructions: INSTRUCTIONS.test,
          input,
          jsonSchema: TEST_SCHEMA,
          reasoningEffort: "high",
        });

        const parsed = safeJsonParse(result.text);
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

        return { content: [{ type: "text" as const, text: result.text }] };
      }

      case "codex_convert": {
        const {
          code,
          source_language,
          target_language,
          conversion_goal,
          project_context,
          conversation_context,
        } = args as {
          code: string;
          source_language: string;
          target_language: string;
          conversion_goal?: string;
          project_context?: string;
          conversation_context?: string;
        };

        const input = buildInput({
          "Source Code": `\`\`\`${source_language}\n${code}\n\`\`\``,
          "Source Language": source_language,
          "Target Language": target_language,
          "Conversion Goal": conversion_goal,
          "Project Context": project_context,
          "Conversion Context": conversation_context,
        });

        const result = await codexClient.request({
          instructions: INSTRUCTIONS.convert,
          input,
          jsonSchema: CONVERT_SCHEMA,
          reasoningEffort: "high",
        });

        const parsed = safeJsonParse(result.text);
        if (parsed && typeof parsed.converted_code === "string") {
          return {
            content: [
              {
                type: "text" as const,
                text: formatConvertOutput(parsed as unknown as ConvertResult),
              },
            ],
          };
        }

        return { content: [{ type: "text" as const, text: result.text }] };
      }

      case "codex_architect": {
        const {
          requirements,
          constraints,
          design_question,
          existing_system,
          conversation_context,
        } = args as {
          requirements: string;
          constraints?: string;
          design_question?: string;
          existing_system?: string;
          conversation_context?: string;
        };

        const input = buildInput({
          Requirements: requirements,
          Constraints: constraints,
          "Design Question": design_question,
          "Existing System": existing_system,
          Context: conversation_context,
        });

        const result = await codexClient.request({
          instructions: INSTRUCTIONS.architect,
          input,
          jsonSchema: ARCHITECT_SCHEMA,
          reasoningEffort: "xhigh",
        });

        const parsed = safeJsonParse(result.text);
        if (parsed && typeof parsed.design === "string") {
          return {
            content: [
              {
                type: "text" as const,
                text: formatArchitectOutput(
                  parsed as unknown as ArchitectResult,
                ),
              },
            ],
          };
        }

        return { content: [{ type: "text" as const, text: result.text }] };
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
