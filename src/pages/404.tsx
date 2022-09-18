import { memo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { Alert, AlertTitle } from '@material-ui/lab';
import { useLocale } from '../hooks/useLocale';
import { Button } from '@material-ui/core';
import { KeyboardArrowLeft } from '@material-ui/icons';

const NotFound = () => {
  const { I18n } = useLocale();

  return (
    <>
      <Alert severity="warning">
        <AlertTitle>{I18n.t('page not found')}</AlertTitle>
        {I18n.t('page not found description')}
      </Alert>
      <Link href="/discover" passHref>
        <Button color="primary" startIcon={<KeyboardArrowLeft />}>
          {I18n.t('back to our site')}
        </Button>
      </Link>
    </>
  );
};

export default memo(function Custom404() {
  const { I18n } = useLocale();

  return (
    <Layout hideBottomNav={false} fullWidth={false}>
      <Head>
        <title>{`${I18n.t('page not found')} | Qoodish`}</title>
        <meta name="robots" content="noindex" />
      </Head>

      <NotFound />
    </Layout>
  );
});
