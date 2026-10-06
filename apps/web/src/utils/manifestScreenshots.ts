import type { MetadataRoute } from 'next';
import { getDictionary } from './getDictionary.ts';
import { type Locale, toLocale } from './locales.ts';

type FormFactor = 'narrow' | 'wide';

type Scene = 'home' | 'map';

const SIZES: Record<FormFactor, string> = {
  narrow: '824x1830',
  wide: '1280x800'
};

const SCREENSHOT_PATHS: Record<
  Locale,
  Record<Scene, Record<FormFactor, string>>
> = {
  en: {
    home: {
      narrow: '/screenshots/home-narrow-en-eda9dfa9.webp',
      wide: '/screenshots/home-wide-en-d1df7de8.webp'
    },
    map: {
      narrow: '/screenshots/map-narrow-en-34f76d4e.webp',
      wide: '/screenshots/map-wide-en-0f6aee81.webp'
    }
  },
  ja: {
    home: {
      narrow: '/screenshots/home-narrow-ja-a9bc913e.webp',
      wide: '/screenshots/home-wide-ja-56912512.webp'
    },
    map: {
      narrow: '/screenshots/map-narrow-ja-b5ed8a46.webp',
      wide: '/screenshots/map-wide-ja-33d8aba0.webp'
    }
  }
};

const LABEL_KEYS: Record<Scene, string> = {
  home: 'screenshot home',
  map: 'screenshot map'
};

export function manifestScreenshots(
  lang: string
): NonNullable<MetadataRoute.Manifest['screenshots']> {
  const locale = toLocale(lang);
  const dict = getDictionary(locale);
  const scenes = SCREENSHOT_PATHS[locale];

  return (['narrow', 'wide'] as const).flatMap((formFactor) =>
    (Object.keys(scenes) as Scene[]).map((scene) => ({
      src: scenes[scene][formFactor],
      sizes: SIZES[formFactor],
      type: 'image/webp',
      form_factor: formFactor,
      label: dict[LABEL_KEYS[scene]]
    }))
  );
}
