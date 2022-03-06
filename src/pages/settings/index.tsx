import React from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import I18n from '../../utils/I18n';
import { makeStyles, useTheme } from '@material-ui/core';
import PushSettings from '../../components/organisms/PushSettings';
import ProviderLinkSettings from '../../components/organisms/ProviderLinkSettings';
import DeleteAccountDialog from '../../components/organisms/DeleteAccountDialog';
import Layout from '../../components/Layout';
import Head from 'next/head';
import DeleteAccountCard from '../../components/organisms/DeleteAccountCard';

const useStyles = makeStyles({
  card: {
    marginBottom: 20
  }
});

const Settings = () => {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const classes = useStyles();

  return (
    <Layout hideBottomNav={false} fullWidth={false}>
      <Head>
        <title>{`${I18n.t('settings')} | Qoodish`}</title>
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/settings`}
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/settings?hl=en`}
          hrefLang="en"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/settings?hl=ja`}
          hrefLang="ja"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/settings`}
          hrefLang="x-default"
        />
        <meta
          name="keywords"
          content="Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, maps, travel, food, group, trip"
        />
        <meta name="title" content={`${I18n.t('settings')} | Qoodish`} />
        <meta name="description" content={I18n.t('meta description')} />
        <meta property="og:title" content={`${I18n.t('settings')} | Qoodish`} />
        <meta property="og:description" content={I18n.t('meta description')} />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_ENDPOINT}/settings`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:image" content={process.env.NEXT_PUBLIC_OGP_IMAGE} />
        <meta
          name="twitter:image"
          content={process.env.NEXT_PUBLIC_OGP_IMAGE}
        />
        <meta
          name="twitter:title"
          content={`${I18n.t('settings')} | Qoodish`}
        />
        <meta name="twitter:description" content={I18n.t('meta description')} />
        <meta property="og:locale" content={I18n.locale} />
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

export default React.memo(Settings);
