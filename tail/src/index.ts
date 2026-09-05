export interface Env {
  ALERT_WEBHOOK_URL?: string;
}

const ALERT_INTERVAL_MS = 5 * 60 * 1000;
const MAX_LINES = 20;

// Module state is per isolate, so this only dampens a burst hitting one
// instance; that is enough to keep a crash loop from flooding the channel.
let lastAlertAt = 0;

function describeRequest(item: TraceItem): string {
  const event = item.event;

  if (event && 'request' in event) {
    return `${event.request.method} ${event.request.url}`;
  }

  return item.scriptName ?? 'unknown script';
}

function describeFailures(item: TraceItem): string[] {
  const lines: string[] = [];

  for (const exception of item.exceptions) {
    lines.push(`${exception.name}: ${exception.message}`);
  }

  for (const log of item.logs) {
    if (log.level === 'error') {
      lines.push(
        (Array.isArray(log.message) ? log.message : [log.message])
          .map(String)
          .join(' ')
      );
    }
  }

  if (lines.length === 0 && item.outcome !== 'ok') {
    lines.push(`outcome: ${item.outcome}`);
  }

  return lines.map((line) => `- ${describeRequest(item)} — ${line}`);
}

// Slack incoming webhooks read `text` and Discord webhooks read `content`, so
// one payload serves either without a per-provider setting.
function buildPayload(
  lines: string[],
  total: number
): {
  text: string;
  content: string;
} {
  const shown = lines.slice(0, MAX_LINES);
  const omitted = total - shown.length;
  const text = [
    `Production errors reported (${total})`,
    ...shown,
    ...(omitted > 0 ? [`… and ${omitted} more`] : [])
  ].join('\n');

  return { text, content: text };
}

export default {
  async tail(events: TraceItem[], env: Env) {
    const lines = events.flatMap(describeFailures);

    if (lines.length === 0 || !env.ALERT_WEBHOOK_URL) {
      return;
    }

    const now = Date.now();

    if (now - lastAlertAt < ALERT_INTERVAL_MS) {
      return;
    }

    try {
      const res = await fetch(env.ALERT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(buildPayload(lines, lines.length)),
        signal: AbortSignal.timeout(10000)
      });

      if (!res.ok) {
        console.error(`alert webhook answered ${res.status}`);
        return;
      }

      lastAlertAt = now;
    } catch (error) {
      console.error('alert webhook delivery failed:', error);
    }
  }
} satisfies ExportedHandler<Env>;
