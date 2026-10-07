import { raw } from 'hono/html';
import type { Child } from 'hono/jsx';
import { type Asset, assetViewport } from '../assets.ts';
import { dictionaryFor, type Locale } from '../i18n/index.ts';

const BRAND_COLOR = '#ffb300';

const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400&family=Lobster&family=Shippori+Mincho:wght@400';

const OG_PHOTO_URL =
  'https://imagedelivery.net/ij3ygWRDWuATHKgheHKS5A/9d7ef63c-55df-4334-c310-04c13463b800/ogp';

const HERO_SCRIM =
  'linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.45) 45%, rgba(0, 0, 0, 0.75) 100%)';

const GLYPH_RATIO = 0.625;

const TAGLINE_FONTS: Record<Locale, string> = {
  en: 'Cinzel',
  ja: '"Shippori Mincho"'
};

export const READY_SELECTOR = 'html[data-ready]';

type FontUse = { family: string; text: string };

function markReadyScript(fonts: FontUse[]): string {
  const json = JSON.stringify(fonts).replaceAll('<', '\\u003c');

  return `Promise.all([
  ...${json}.map(({ family, text }) =>
    document.fonts.load(\`1em \${family}\`, text).then((faces) => {
      if (faces.length === 0) throw new Error(family);
    })
  ),
  ...[...document.images].map((image) => image.decode())
]).then(() => { document.documentElement.dataset.ready = ''; });`;
}

function Document({
  lang,
  width,
  height,
  fonts,
  children
}: {
  lang: string;
  width: number;
  height: number;
  fonts: FontUse[];
  children: Child;
}) {
  return (
    <>
      {raw('<!DOCTYPE html>')}
      <html lang={lang}>
        <head>
          <meta charset="utf-8" />
          <link rel="stylesheet" href={FONTS_URL} />
          <style>
            {`html, body { margin: 0; width: ${width}px; height: ${height}px; background: transparent; overflow: hidden; }`}
          </style>
        </head>
        <body>
          {children}
          <script>{raw(markReadyScript(fonts))}</script>
        </body>
      </html>
    </>
  );
}

function Icon({ asset }: { asset: Extract<Asset, { kind: 'icon' }> }) {
  return (
    <div
      style={{
        display: 'grid',
        'place-items': 'center',
        width: `${asset.size}px`,
        height: `${asset.size}px`,
        background: BRAND_COLOR,
        color: '#ffffff',
        'font-family': 'Lobster, cursive',
        'font-size': `${asset.size * GLYPH_RATIO}px`,
        'line-height': '1'
      }}
    >
      Q
    </div>
  );
}

function OgImage({ asset }: { asset: Extract<Asset, { kind: 'ogImage' }> }) {
  const { width, height } = assetViewport(asset);

  return (
    <div
      style={{
        position: 'relative',
        display: 'grid',
        'place-items': 'center',
        width: `${width}px`,
        height: `${height}px`
      }}
    >
      <img
        src={OG_PHOTO_URL}
        alt=""
        width={width}
        height={height}
        style={{ position: 'absolute', inset: '0' }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '0',
          'background-image': HERO_SCRIM
        }}
      />
      <div
        style={{
          position: 'relative',
          display: 'grid',
          gap: '24px',
          'justify-items': 'center',
          padding: '0 96px',
          color: '#ffffff',
          'text-align': 'center'
        }}
      >
        <p
          style={{
            margin: '0',
            'font-family': 'Lobster, cursive',
            'font-size': '148px',
            'line-height': '1'
          }}
        >
          Qoodish
        </p>
        <p
          style={{
            margin: '0',
            'font-family': `${TAGLINE_FONTS[asset.locale]}, serif`,
            'font-size': '56px',
            'line-height': '1.4'
          }}
        >
          {dictionaryFor(asset.locale).ogTagline}
        </p>
      </div>
    </div>
  );
}

function fontsUsedBy(asset: Asset): FontUse[] {
  if (asset.kind === 'icon') {
    return [{ family: 'Lobster', text: 'Q' }];
  }

  return [
    { family: 'Lobster', text: 'Qoodish' },
    {
      family: TAGLINE_FONTS[asset.locale],
      text: dictionaryFor(asset.locale).ogTagline
    }
  ];
}

export function AssetDocument({ asset }: { asset: Asset }) {
  return (
    <Document
      lang={asset.kind === 'ogImage' ? asset.locale : 'en'}
      fonts={fontsUsedBy(asset)}
      {...assetViewport(asset)}
    >
      {asset.kind === 'icon' ? (
        <Icon asset={asset} />
      ) : (
        <OgImage asset={asset} />
      )}
    </Document>
  );
}
