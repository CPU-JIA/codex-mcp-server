export const tools = [
  {
    name: "codex_generate",
    description:
      "Generate code based on a natural language prompt. Use this for creating new code from scratch, implementing features, or writing functions.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "Natural language description of what code to generate",
        },
        language: {
          type: "string",
          description: "Programming language (e.g., typescript, python, rust)",
        },
        context: {
          type: "string",
          description:
            "Additional context like existing code, dependencies, or requirements",
        },
      },
      required: ["prompt"],
    },
  },
  {
    name: "codex_edit",
    description:
      "Edit existing code based on instructions. Use this for modifying, updating, or improving existing code.",
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "The existing code to edit",
        },
        instruction: {
          type: "string",
          description: "What changes to make to the code",
        },
        language: {
          type: "string",
          description: "Programming language of the code",
        },
      },
      required: ["code", "instruction"],
    },
  },
  {
    name: "codex_explain",
    description:
      "Explain how code works. Use this for understanding complex code, algorithms, or logic.",
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "The code to explain",
        },
        language: {
          type: "string",
          description: "Programming language of the code",
        },
        focus: {
          type: "string",
          description:
            "Specific aspect to focus on (e.g., 'performance', 'security', 'algorithm')",
        },
      },
      required: ["code"],
    },
  },
  {
    name: "codex_fix",
    description:
      "Fix buggy code based on error messages. Use this for debugging and fixing runtime or compilation errors.",
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "The code with the bug",
        },
        error: {
          type: "string",
          description: "The error message or description of the bug",
        },
        language: {
          type: "string",
          description: "Programming language of the code",
        },
      },
      required: ["code", "error"],
    },
  },
  {
    name: "codex_refactor",
    description:
      "Refactor code to improve quality, readability, or performance. Use this for code cleanup and optimization.",
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "The code to refactor",
        },
        goal: {
          type: "string",
          description:
            "Refactoring goal (e.g., 'improve readability', 'optimize performance', 'reduce complexity')",
        },
        language: {
          type: "string",
          description: "Programming language of the code",
        },
      },
      required: ["code", "goal"],
    },
  },
];
