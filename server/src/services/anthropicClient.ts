import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

interface StructuredPromptParams {
  system: string;
  userMessage: string;
  schema: Record<string, unknown>;
}

/**
 * Runs a single short request against Claude, constraining the response to
 * the given JSON schema via structured outputs so the result is guaranteed
 * parseable — no prose-JSON + JSON.parse guesswork.
 */
export async function runStructuredPrompt<T>(params: StructuredPromptParams): Promise<T> {
  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: "disabled" },
    system: params.system,
    messages: [{ role: "user", content: params.userMessage }],
    output_config: {
      format: { type: "json_schema", schema: params.schema },
    },
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Anthropic response contained no text block.");
  }
  return JSON.parse(textBlock.text) as T;
}
