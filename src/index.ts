#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { CodexClient } from "./codex-client.js";
import { tools } from "./tools.js";

const CODEX_API_BASE_URL = process.env.CODEX_API_BASE_URL;
const CODEX_API_KEY = process.env.CODEX_API_KEY;
const CODEX_MODEL = process.env.CODEX_MODEL || "gpt-5.3-codex";
const CODEX_REASONING_EFFORT = process.env.CODEX_REASONING_EFFORT as
  | "none"
  | "minimal"
  | "low"
  | "medium"
  | "high"
  | "xhigh"
  | undefined;

if (!CODEX_API_BASE_URL || !CODEX_API_KEY) {
  console.error("Error: CODEX_API_BASE_URL and CODEX_API_KEY must be set");
  process.exit(1);
}

const codexClient = new CodexClient({
  baseURL: CODEX_API_BASE_URL,
  apiKey: CODEX_API_KEY,
  model: CODEX_MODEL,
  timeout: parseInt(process.env.CODEX_TIMEOUT || "60000"),
  maxTokens: parseInt(process.env.CODEX_MAX_TOKENS || "4096"),
  reasoningEffort: CODEX_REASONING_EFFORT,
});

const server = new Server(
  {
    name: "codex-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "codex_generate": {
        const { prompt, language, context } = args as {
          prompt: string;
          language?: string;
          context?: string;
        };

        const input = buildGenerateInput(prompt, language, context);
        const result = await codexClient.generate(input);

        return {
          content: [
            {
              type: "text",
              text: result,
            },
          ],
        };
      }

      case "codex_edit": {
        const { code, instruction, language } = args as {
          code: string;
          instruction: string;
          language?: string;
        };

        const input = buildEditInput(code, instruction, language);
        const result = await codexClient.generate(input);

        return {
          content: [
            {
              type: "text",
              text: result,
            },
          ],
        };
      }

      case "codex_explain": {
        const { code, language, focus } = args as {
          code: string;
          language?: string;
          focus?: string;
        };

        const input = buildExplainInput(code, language, focus);
        const result = await codexClient.generate(input);

        return {
          content: [
            {
              type: "text",
              text: result,
            },
          ],
        };
      }

      case "codex_fix": {
        const { code, error, language } = args as {
          code: string;
          error: string;
          language?: string;
        };

        const input = buildFixInput(code, error, language);
        const result = await codexClient.generate(input);

        return {
          content: [
            {
              type: "text",
              text: result,
            },
          ],
        };
      }

      case "codex_refactor": {
        const { code, goal, language } = args as {
          code: string;
          goal: string;
          language?: string;
        };

        const input = buildRefactorInput(code, goal, language);
        const result = await codexClient.generate(input);

        return {
          content: [
            {
              type: "text",
              text: result,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

function buildGenerateInput(
  prompt: string,
  language?: string,
  context?: string,
): string {
  let input = "";

  if (language) {
    input += `Language: ${language}\n\n`;
  }

  if (context) {
    input += `Context:\n${context}\n\n`;
  }

  input += `Task: ${prompt}\n\nGenerate the code:`;

  return input;
}

function buildEditInput(
  code: string,
  instruction: string,
  language?: string,
): string {
  let input = "";

  if (language) {
    input += `Language: ${language}\n\n`;
  }

  input += `Original code:\n\`\`\`\n${code}\n\`\`\`\n\n`;
  input += `Instruction: ${instruction}\n\n`;
  input += `Modified code:`;

  return input;
}

function buildExplainInput(
  code: string,
  language?: string,
  focus?: string,
): string {
  let input = "";

  if (language) {
    input += `Language: ${language}\n\n`;
  }

  input += `Code:\n\`\`\`\n${code}\n\`\`\`\n\n`;

  if (focus) {
    input += `Focus on: ${focus}\n\n`;
  }

  input += `Explain this code:`;

  return input;
}

function buildFixInput(code: string, error: string, language?: string): string {
  let input = "";

  if (language) {
    input += `Language: ${language}\n\n`;
  }

  input += `Code with error:\n\`\`\`\n${code}\n\`\`\`\n\n`;
  input += `Error message:\n${error}\n\n`;
  input += `Fixed code:`;

  return input;
}

function buildRefactorInput(
  code: string,
  goal: string,
  language?: string,
): string {
  let input = "";

  if (language) {
    input += `Language: ${language}\n\n`;
  }

  input += `Original code:\n\`\`\`\n${code}\n\`\`\`\n\n`;
  input += `Refactoring goal: ${goal}\n\n`;
  input += `Refactored code:`;

  return input;
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Codex MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
