type ReasoningEffort = "none" | "minimal" | "low" | "medium" | "high" | "xhigh";

interface CodexClientConfig {
  baseURL: string;
  apiKey: string;
  model: string;
  timeout: number;
  maxTokens: number;
  reasoningEffort?: ReasoningEffort;
}

interface JsonSchemaFormat {
  name: string;
  schema: Record<string, unknown>;
}

interface CodexRequestOptions {
  instructions: string;
  input: string;
  jsonSchema?: JsonSchemaFormat;
  reasoningEffort?: ReasoningEffort;
  maxTokens?: number;
}

interface CodexOutputText {
  type: "output_text";
  text: string;
}

interface CodexOutputMessage {
  type: "message";
  role: string;
  content: Array<CodexOutputText>;
}

interface CodexResponse {
  id: string;
  status: string;
  output: Array<CodexOutputMessage>;
  usage?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}

export class CodexClient {
  private config: CodexClientConfig;

  constructor(config: CodexClientConfig) {
    this.config = config;
  }

  async request(options: CodexRequestOptions): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const effort = options.reasoningEffort ?? this.config.reasoningEffort;
      const maxTokens = options.maxTokens ?? this.config.maxTokens;

      const requestBody: Record<string, unknown> = {
        model: this.config.model,
        instructions: options.instructions,
        input: [{ role: "user", content: options.input }],
        max_output_tokens: maxTokens,
        store: false,
      };

      if (effort) {
        requestBody.reasoning = { effort };
      }

      if (options.jsonSchema) {
        requestBody.text = {
          format: {
            type: "json_schema",
            name: options.jsonSchema.name,
            strict: true,
            schema: options.jsonSchema.schema,
          },
        };
      }

      const response = await fetch(`${this.config.baseURL}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Codex API error (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as CodexResponse;

      if (data.status !== "completed") {
        throw new Error(`Unexpected response status: ${data.status}`);
      }

      const textContent = data.output
        ?.flatMap((item) => item.content ?? [])
        .find((c) => c.type === "output_text");

      if (!textContent?.text) {
        throw new Error("No text content in response");
      }

      return textContent.text;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error(`Request timeout after ${this.config.timeout}ms`);
        }
        throw error;
      }

      throw new Error(`Unknown error: ${String(error)}`);
    }
  }
}

export type {
  CodexClientConfig,
  CodexRequestOptions,
  JsonSchemaFormat,
  ReasoningEffort,
};
