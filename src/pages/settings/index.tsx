import { makeStyles } from '@material-ui/core';
import PushSettings from '../../components/organisms/PushSettings';
import ProviderLinkSettings from '../../components/organisms/ProviderLinkSettings';
import DeleteAccountDialog from '../../components/organisms/DeleteAccountDialog';
import Layout from '../../components/Layout';
import Head from 'next/head';
import DeleteAccountCard from '../../components/organisms/DeleteAccountCard';
import { useRouter } from 'next/router';
import { useLocale } from '../../hooks/useLocale';
import { memo } from 'react';

const useStyles = makeStyles({
  card: {
    marginBottom: 20
  }
});

const Settings = () => {
  const router = useRouter();
  const classes = useStyles();
  const { I18n } = useLocale();

  const title = `${I18n.t('settings')} | Qoodish`;
  const description = I18n.t('meta description');
  const thumbnailUrl = process.env.NEXT_PUBLIC_OGP_IMAGE_URL;
  const basePath =
    router.locale === router.defaultLocale ? '' : `/${router.locale}`;

  return (
    <Layout hideBottomNav={false} fullWidth={false}>
      <Head>
        <title>{title}</title>

        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}${router.pathname}`}
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}${router.pathname}`}
          hrefLang="en"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/ja${router.pathname}`}
          hrefLang="ja"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}${router.pathname}`}
          hrefLang="x-default"
        />

        <meta
          name="keywords"
          content="Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, maps, travel, food, group, trip"
        />
        <meta name="description" content={description} />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}${router.pathname}`}
        />
        <meta property="og:image" content={thumbnailUrl} />

        <meta name="twitter:card" content="summary_large_image" />

        <meta property="og:locale" content={router.locale} />
        <meta property="og:site_name" content={I18n.t('meta headline')} />
      </Head>

      <div className={classes.card}>
        <PushSettings />
      </div>
      <div className={classes.card}>
        <ProviderLinkSettings />
      </div>
      <div className={classes.card}>
        <DeleteAccountCard />
      </div>
      <DeleteAccountDialog />
    </Layout>
  );
};

export default memo(Settings);
