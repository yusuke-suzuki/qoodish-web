const TIMESTAMP =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?)?\s*(Z|[+-]\d{2}(?::?\d{2})?)?$/i;

const FIELD_RANGES: readonly (readonly [number, number])[] = [
  [1, 12],
  [1, 31],
  [0, 24],
  [0, 59],
  [0, 60]
];

function offsetMinutes(zone: string | undefined): number {
  if (!zone || zone.toUpperCase() === 'Z') {
    return 0;
  }

  const digits = zone.replace(':', '');
  const minutes =
    Number(digits.slice(1, 3)) * 60 + Number(digits.slice(3, 5) || 0);

  return digits.startsWith('-') ? -minutes : minutes;
}

export function parseTimestamp(text: string): string | null {
  const match = TIMESTAMP.exec(text.trim());

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second, fraction, zone] = match;
  const fields = [month, day, hour, minute, second].map((part) =>
    Number(part ?? 0)
  );

  if (
    fields.some(
      (value, index) =>
        value < FIELD_RANGES[index][0] || value > FIELD_RANGES[index][1]
    )
  ) {
    return null;
  }

  const [monthNumber, dayNumber, hours, minutes, seconds] = fields;
  const utc =
    Date.UTC(
      Number(year),
      monthNumber - 1,
      dayNumber,
      hours,
      minutes,
      seconds
    ) -
    offsetMinutes(zone) * 60_000;
  const wholeSeconds = new Date(utc).toISOString().slice(0, 19);
  const micros = (fraction ?? '').slice(0, 6).padEnd(6, '0');

  return `${wholeSeconds}.${micros}Z`;
}
