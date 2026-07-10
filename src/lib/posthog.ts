import { PostHog } from "posthog-node";

let _client: PostHog | null = null;

export function getPostHogServer(): PostHog | null {
  if (!process.env.POSTHOG_API_KEY) return null;
  if (!_client) {
    _client = new PostHog(process.env.POSTHOG_API_KEY, {
      host: process.env.POSTHOG_HOST ?? "https://eu.i.posthog.com",
      flushAt: 20,
      flushInterval: 10000,
    });
  }
  return _client;
}

/** Sunucu tarafı olay kaydı — hata fırlatmaz */
export function capture(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  try {
    getPostHogServer()?.capture({ distinctId, event, properties });
  } catch {
    // PostHog hatası uygulamayı durdurmasın
  }
}
