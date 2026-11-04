/**
 * Server-side PostHog client (posthog-node).
 *
 * Captures `$ai_generation` events from every Bedrock call so PostHog's
 * AI Observability dashboard can show model, tokens, latency, and cost
 * per workflow step and per user.
 *
 * User context is propagated through an AsyncLocalStorage store so
 * invokeModel() can tag each event with the right distinct_id and
 * project_id without threading those values manually through every call.
 */

import { AsyncLocalStorage } from "async_hooks";
import { randomUUID } from "crypto";
import { PostHog } from "posthog-node";

const PROJECT_TOKEN = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const HOST = "https://us.i.posthog.com";

/** Lazily-initialised singleton — skipped when the token is absent (e.g. tests). */
let _client: PostHog | null = null;

function getClient(): PostHog | null {
  if (!PROJECT_TOKEN) return null;
  if (!_client) {
    _client = new PostHog(PROJECT_TOKEN, {
      host: HOST,
      // Flush immediately so events aren't lost in short-lived server actions.
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return _client;
}

// ---------------------------------------------------------------------------
// Per-request context (user + project) propagated via AsyncLocalStorage
// ---------------------------------------------------------------------------

interface AiContext {
  userId: string;
  projectId: string;
}

const aiContextStorage = new AsyncLocalStorage<AiContext>();

/**
 * Wrap an AI provider call with a user/project context so that every
 * `$ai_generation` event fired inside is tagged with the right distinct_id.
 *
 * Usage in a server action:
 *   result = await runWithAiContext({ userId: user.id, projectId }, () =>
 *     getAIProvider().analyzeWebsite(input)
 *   );
 */
export function runWithAiContext<T>(context: AiContext, fn: () => T): T {
  return aiContextStorage.run(context, fn);
}

export function getAiContext(): AiContext | undefined {
  return aiContextStorage.getStore();
}

// ---------------------------------------------------------------------------
// $ai_generation capture helper
// ---------------------------------------------------------------------------

const MAX_CONTENT_CHARS = 2000;

function truncate(s: string): string {
  return s.length > MAX_CONTENT_CHARS ? `${s.slice(0, MAX_CONTENT_CHARS)}…` : s;
}

export interface CaptureAiGenerationParams {
  /** Maps to $ai_span_name — e.g. "analyzeWebsite", "generateOutline". */
  spanName: string;
  /** Bedrock model ID, e.g. "au.anthropic.claude-sonnet-4-5-20250929-v1:0". */
  model: string;
  /** The full user prompt sent to the model. */
  inputPrompt: string;
  /** The raw text response from the model (empty string on error). */
  outputText: string;
  inputTokens?: number;
  outputTokens?: number;
  /** Wall-clock seconds from request start to response received. */
  latencySeconds: number;
  isError?: boolean;
  error?: string;
}

export function captureAiGeneration(params: CaptureAiGenerationParams): void {
  const client = getClient();
  if (!client) return;

  const ctx = getAiContext();
  const distinctId = ctx?.userId ?? "anonymous";

  client.capture({
    distinctId,
    event: "$ai_generation",
    properties: {
      $ai_trace_id: randomUUID(),
      $ai_span_name: params.spanName,
      $ai_model: params.model,
      $ai_provider: "anthropic",
      $ai_input: [{ role: "user", content: truncate(params.inputPrompt) }],
      $ai_input_tokens: params.inputTokens,
      $ai_output_choices: params.isError
        ? []
        : [{ role: "assistant", content: truncate(params.outputText) }],
      $ai_output_tokens: params.outputTokens,
      $ai_latency: params.latencySeconds,
      $ai_is_error: params.isError ?? false,
      ...(params.error ? { $ai_error: params.error } : {}),
      // Custom property — lets you filter by project in PostHog.
      ...(ctx?.projectId ? { project_id: ctx.projectId } : {}),
    },
  });
}
