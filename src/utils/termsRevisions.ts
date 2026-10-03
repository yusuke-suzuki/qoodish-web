const TERMS_UTC_OFFSET = '+09:00';

export function isBeforeEffectiveDate(effectiveOn: string, now: Date): boolean {
  return (
    now.getTime() < Date.parse(`${effectiveOn}T00:00:00${TERMS_UTC_OFFSET}`)
  );
}

export function formatEffectiveDate(lang: string, effectiveOn: string): string {
  return new Intl.DateTimeFormat(lang, {
    dateStyle: 'long',
    timeZone: 'UTC'
  }).format(new Date(`${effectiveOn}T00:00:00Z`));
}
