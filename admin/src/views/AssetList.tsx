import {
  type Asset,
  assetFileName,
  assetViewport,
  ICON_PURPOSES,
  ICON_SIZES
} from '../assets.ts';
import { dictionaryFor, LOCALES, type Locale } from '../i18n/index.ts';
import { Layout } from './Layout.tsx';

const PREVIEW_ICON_SIZE = 192;

const PREVIEW_OG_IMAGE_WIDTH = 360;

function assetPath(asset: Asset): string {
  return `/assets/${assetFileName(asset)}`;
}

function DownloadLink({ asset, label }: { asset: Asset; label: string }) {
  return (
    <a href={assetPath(asset)} download={assetFileName(asset)}>
      {label}
    </a>
  );
}

export function AssetList({ locale }: { locale: Locale }) {
  const dict = dictionaryFor(locale);

  return (
    <Layout locale={locale} title={dict.assets} path="/assets">
      <h1>{dict.assets}</h1>

      <section class="card">
        <h2>{dict.appIcons}</h2>
        <p class="muted">{dict.appIconsHelp}</p>

        <ul class="asset-previews">
          {ICON_PURPOSES.map((purpose) => {
            const asset: Asset = { kind: 'icon', purpose, size: 512 };

            return (
              <li key={purpose}>
                <img
                  src={assetPath(asset)}
                  alt={dict.iconPurposes[purpose]}
                  width={PREVIEW_ICON_SIZE}
                  height={PREVIEW_ICON_SIZE}
                  loading="lazy"
                />
                <span>{dict.iconPurposes[purpose]}</span>
              </li>
            );
          })}
        </ul>

        <table class="asset-table">
          <thead>
            <tr>
              <th scope="col">{dict.size}</th>
              {ICON_PURPOSES.map((purpose) => (
                <th key={purpose} scope="col">
                  {dict.iconPurposes[purpose]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ICON_SIZES.map((size) => (
              <tr key={size}>
                <th scope="row">{`${size}×${size}`}</th>
                {ICON_PURPOSES.map((purpose) => (
                  <td key={purpose}>
                    <DownloadLink
                      asset={{ kind: 'icon', purpose, size }}
                      label={dict.download}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section class="card">
        <h2>{dict.ogImages}</h2>
        <p class="muted">{dict.ogImagesHelp}</p>

        <ul class="asset-previews">
          {LOCALES.map((imageLocale) => {
            const asset: Asset = { kind: 'ogImage', locale: imageLocale };
            const { width, height } = assetViewport(asset);

            return (
              <li key={imageLocale}>
                <img
                  src={assetPath(asset)}
                  alt={dict.languages[imageLocale]}
                  width={PREVIEW_OG_IMAGE_WIDTH}
                  height={Math.round((PREVIEW_OG_IMAGE_WIDTH * height) / width)}
                  loading="lazy"
                />
                <DownloadLink
                  asset={asset}
                  label={`${dict.download} (${dict.languages[imageLocale]})`}
                />
              </li>
            );
          })}
        </ul>
      </section>
    </Layout>
  );
}
