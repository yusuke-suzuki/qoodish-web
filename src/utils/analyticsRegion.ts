export const ANALYTICS_COOKIE = 'analytics_allowed';

const EU_COUNTRIES = [
  'AT',
  'BE',
  'BG',
  'CY',
  'CZ',
  'DE',
  'DK',
  'EE',
  'ES',
  'FI',
  'FR',
  'GR',
  'HR',
  'HU',
  'IE',
  'IT',
  'LT',
  'LU',
  'LV',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SE',
  'SI',
  'SK'
];

const EU_TERRITORIES_WITH_OWN_CODES = [
  'AX',
  'GF',
  'GP',
  'MF',
  'MQ',
  'RE',
  'YT'
];

const EEA_ONLY_COUNTRIES = ['IS', 'LI', 'NO'];

const GDPR_EQUIVALENT_JURISDICTIONS = ['GB', 'GG', 'GI', 'IM', 'JE', 'CH'];

const UNKNOWN_OR_ANONYMIZED = ['XX', 'T1'];

export const ANALYTICS_RESTRICTED_COUNTRIES: ReadonlySet<string> = new Set([
  ...EU_COUNTRIES,
  ...EU_TERRITORIES_WITH_OWN_CODES,
  ...EEA_ONLY_COUNTRIES,
  ...GDPR_EQUIVALENT_JURISDICTIONS,
  ...UNKNOWN_OR_ANONYMIZED
]);

export function analyticsAllowed(
  country: string | null | undefined,
  isLocalDevelopment: boolean
): boolean {
  if (!country) {
    return isLocalDevelopment;
  }

  return !ANALYTICS_RESTRICTED_COUNTRIES.has(country.toUpperCase());
}

export function hasAnalyticsCookie(cookieHeader: string): boolean {
  return cookieHeader
    .split(';')
    .some((cookie) => cookie.trim() === `${ANALYTICS_COOKIE}=1`);
}
