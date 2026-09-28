const SECONDS_PER_UNIT: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60]
];

export function relativeTime(locale: string, from: Date, now: Date): string {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((now.getTime() - from.getTime()) / 1000)
  );

  for (const [unit, seconds] of SECONDS_PER_UNIT) {
    if (elapsedSeconds >= seconds) {
      return new Intl.RelativeTimeFormat(locale).format(
        -Math.floor(elapsedSeconds / seconds),
        unit
      );
    }
  }

  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
    -elapsedSeconds,
    'second'
  );
}
