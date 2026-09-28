export const LOCALES = ['en', 'ja'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: string | undefined | null): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function toLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function preferredLocale(acceptLanguage: string | null): Locale {
  let best: Locale = DEFAULT_LOCALE;
  let bestWeight = 0;

  for (const entry of acceptLanguage?.split(',') ?? []) {
    const [tag, ...params] = entry.trim().split(';');
    const language = tag.slice(0, 2).toLowerCase();
    const weightParam = params.find((param) =>
      param.trim().toLowerCase().startsWith('q=')
    );
    const weight = weightParam
      ? Number.parseFloat(weightParam.trim().slice(2))
      : 1;

    if (isLocale(language) && weight > bestWeight) {
      best = language;
      bestWeight = weight;
    }
  }

  return best;
}

export function localePath(locale: string, path = ''): string {
  const normalized = path === '/' ? '' : path;
  return `/${toLocale(locale)}${normalized}`;
}
