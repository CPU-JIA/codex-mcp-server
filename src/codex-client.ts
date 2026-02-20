interface CodexClientConfig {
  baseURL: string;
  apiKey: string;
  model: string;
  timeout: number;
  maxTokens: number;
  reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high" | "xhigh";
}

interface CodexResponse {
  id: string;
  type: string;
  status: string;
  content: Array<{
    type: string;
    text?: string;
  }>;
}

export class CodexClient {
  private config: CodexClientConfig;

  constructor(config: CodexClientConfig) {
    this.config = config;
  }

  async generate(input: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const requestBody: any = {
        model: this.config.model,
        input: [
          {
            role: "user",
            content: input,
          },
        ],
        max_output_tokens: this.config.maxTokens,
      };

      if (this.config.reasoningEffort) {
        requestBody.reasoning = {
          effort: this.config.reasoningEffort,
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

      const textContent = data.content.find((c) => c.type === "output_text");
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

  async generateStream(
    input: string,
    onChunk: (text: string) => void,
  ): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const requestBody: any = {
        model: this.config.model,
        input: [
          {
            role: "user",
            content: input,
          },
        ],
        max_output_tokens: this.config.maxTokens,
        stream: true,
      };

      if (this.config.reasoningEffort) {
        requestBody.reasoning = {
          effort: this.config.reasoningEffort,
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

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim() || line.startsWith(":")) continue;

          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              return;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === "response.output_text.delta") {
                onChunk(parsed.delta || "");
              }
            } catch (e) {
              console.error("Failed to parse SSE data:", e);
            }
          }
        }
      }
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
