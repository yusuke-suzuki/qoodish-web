import type { Env } from './index.ts';

export async function notify(env: Env, text: string): Promise<void> {
  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.SLACK_BOT_TOKEN}`,
      'content-type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ channel: env.SLACK_CHANNEL_ID, text })
  });

  // Slack answers 200 even when it refuses the message, so only the body says
  // whether the alert went out.
  const body = (await res.json()) as { ok: boolean; error?: string };

  if (!body.ok) {
    console.error('Slack rejected the notification:', body.error);
  }
}
