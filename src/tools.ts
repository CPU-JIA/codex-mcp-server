export const tools = [
  {
    name: "codex_generate",
    description: [
      "Generate code using Codex deep reasoning. Use for complex tasks where a second expert perspective adds value.",
      "",
      "Returns structured JSON: { code, language, explanation, dependencies }",
      "",
      "When to use:",
      "- Complex algorithms, data structures, state machines",
      "- Performance-critical code requiring deep optimization",
      "- System design implementations (interpreters, compilers, protocols)",
      "- When you want a different model's approach to a hard problem",
      "",
      "Do NOT use for simple code generation — handle that natively.",
    ].join("\n"),
    inputSchema: {
      type: "object" as const,
      properties: {
        prompt: {
          type: "string",
          description:
            "What to generate. Be specific: requirements, constraints, expected behavior.",
        },
        language: {
          type: "string",
          description: "Target language (e.g., typescript, python, rust, go).",
        },
        project_context: {
          type: "string",
          description:
            "Project info: tech stack, conventions, architecture. Pass CLAUDE.md or relevant standards.",
        },
        files: {
          type: "string",
          description:
            "Related source files. Include types, interfaces, imports the generated code should reference.",
        },
        conversation_context: {
          type: "string",
          description:
            "Recent conversation summary: what was discussed, decided, or attempted.",
        },
      },
      required: ["prompt"],
    },
  },
  {
    name: "codex_review",
    description: [
      "Independent code review from a second AI. Analyzes security, performance, and best practices that the primary AI might miss.",
      "",
      "Returns structured JSON: { findings: [{ severity, category, location, issue, suggestion }], summary, score }",
      "",
      "When to use:",
      "- Before committing security-sensitive code (auth, crypto, input validation)",
      "- Performance-critical paths that need independent analysis",
      "- When you want a second opinion on code quality",
      "- PR review where an independent perspective matters",
      "",
      "Severity levels: critical, high, medium, low, info",
      "Score range: 0-100 (90+ excellent, 70-89 good, 50-69 needs work, <50 concerning)",
    ].join("\n"),
    inputSchema: {
      type: "object" as const,
      properties: {
        code: {
          type: "string",
          description: "Code to review.",
        },
        language: {
          type: "string",
          description: "Programming language of the code.",
        },
        focus: {
          type: "string",
          enum: ["security", "performance", "best-practices", "all"],
          description: "Review focus area. Default: all.",
        },
        project_context: {
          type: "string",
          description:
            "Project conventions, lint rules, architectural guidelines.",
        },
        conversation_context: {
          type: "string",
          description:
            "Why this review is needed: what changed, what concerns exist.",
        },
      },
      required: ["code"],
    },
  },
  {
    name: "codex_test",
    description: [
      "Generate comprehensive test suites with deep reasoning for edge case coverage.",
      "",
      "Returns structured JSON: { test_code, language, framework, test_cases: [{ name, description, type }], coverage_notes }",
      "",
      "When to use:",
      "- Complex business logic needing thorough edge case coverage",
      "- Functions with many branches, error paths, or boundary conditions",
      "- When test quality directly impacts reliability",
      "- Integration tests requiring careful mock setup",
      "",
      "Test case types: unit, integration, edge-case, error-handling",
    ].join("\n"),
    inputSchema: {
      type: "object" as const,
      properties: {
        code: {
          type: "string",
          description: "Code to generate tests for.",
        },
        language: {
          type: "string",
          description: "Programming language (e.g., typescript, python).",
        },
        framework: {
          type: "string",
          description: "Test framework (e.g., jest, vitest, pytest, go test).",
        },
        project_context: {
          type: "string",
          description:
            "Project test conventions: existing patterns, mock strategies, test directory structure.",
        },
        conversation_context: {
          type: "string",
          description:
            "Context about the code: known issues, requirements, what needs coverage.",
        },
      },
      required: ["code"],
    },
  },
  {
    name: "codex_convert",
    description: [
      "Convert code between languages, frameworks, or architectural patterns using deep reasoning.",
      "",
      "Returns structured JSON: { converted_code, target_language, conversion_notes, breaking_changes }",
      "",
      "When to use:",
      "- Language migration (Python→Rust, JavaScript→TypeScript, Go→Zig)",
      "- Framework migration (REST→GraphQL, React→Vue, Express→Fastify)",
      "- Pattern migration (callbacks→async/await, class→functional)",
      "- API version upgrades with breaking changes",
      "",
      "Do NOT use for simple syntax translation — use native tools or simple prompts.",
    ].join("\n"),
    inputSchema: {
      type: "object" as const,
      properties: {
        code: {
          type: "string",
          description: "Source code to convert.",
        },
        source_language: {
          type: "string",
          description:
            "Source language/framework (e.g., python, react, rest-api).",
        },
        target_language: {
          type: "string",
          description: "Target language/framework (e.g., rust, vue, graphql).",
        },
        conversion_goal: {
          type: "string",
          description:
            "What to preserve/optimize during conversion (e.g., 'maintain API compatibility', 'optimize for performance', 'idiomatic target language').",
        },
        project_context: {
          type: "string",
          description: "Target project conventions, dependencies, constraints.",
        },
        conversation_context: {
          type: "string",
          description: "Why this conversion is needed, migration strategy.",
        },
      },
      required: ["code", "source_language", "target_language"],
    },
  },
  {
    name: "codex_architect",
    description: [
      "System design and architectural decision-making with deep reasoning.",
      "",
      "Returns structured JSON: { design, rationale, tradeoffs, implementation_steps, risks }",
      "",
      "When to use:",
      "- Designing system architecture from requirements",
      "- Choosing between architectural patterns (microservices vs monolith, event-driven vs request-response)",
      "- Data modeling and schema design",
      "- Technology stack selection with tradeoff analysis",
      "- Scalability and performance architecture",
      "",
      "Do NOT use for implementation details — use codex_generate for that.",
    ].join("\n"),
    inputSchema: {
      type: "object" as const,
      properties: {
        requirements: {
          type: "string",
          description:
            "System requirements: functional requirements, non-functional requirements (scale, performance, reliability).",
        },
        constraints: {
          type: "string",
          description:
            "Technical constraints: budget, team size, existing infrastructure, compliance requirements.",
        },
        design_question: {
          type: "string",
          description:
            "Specific architectural question or decision to make (e.g., 'Should we use microservices?', 'How to handle real-time updates?').",
        },
        existing_system: {
          type: "string",
          description:
            "Current system architecture if this is a migration or evolution.",
        },
        conversation_context: {
          type: "string",
          description:
            "Previous architectural discussions, decisions made, options considered.",
        },
      },
      required: ["requirements"],
    },
  },
];
