/** The Anthropic API key lives only in server/.env — never in the DB or a response body. */
export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}
