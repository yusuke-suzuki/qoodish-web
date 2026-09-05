import type { CheckResult } from './checks.ts';

// Slack incoming webhooks read `text` and Discord webhooks read `content`, so
// one payload serves either without a per-provider setting.
export function buildAlertPayload(
  origin: string,
  failures: CheckResult[]
): { text: string; content: string } {
  const lines = failures.map(
    (failure) => `- ${failure.name}: ${failure.error ?? 'failed'}`
  );
  const text = [`Synthetic checks failed for ${origin}`, ...lines].join('\n');

  return { text, content: text };
}

export async function notifyFailures(
  webhookUrl: string,
  origin: string,
  failures: CheckResult[]
): Promise<void> {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(buildAlertPayload(origin, failures)),
    signal: AbortSignal.timeout(10000)
  });

  if (!res.ok) {
    throw new Error(`alert webhook answered ${res.status}`);
  }
}
