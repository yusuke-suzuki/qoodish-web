import React, { memo } from 'react';
import Head from 'next/head';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Button from '@material-ui/core/Button';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import Link from 'next/link';
import I18n from '../utils/I18n';
import Layout from '../components/Layout';

const NotFound = () => {
  return (
    <>
      <Alert severity="warning">
        <AlertTitle>{I18n.t('page not found')}</AlertTitle>
        {I18n.t('page not found description')}
      </Alert>
      <Link href="/discover" passHref>
        <Button color="primary" startIcon={<KeyboardArrowLeftIcon />}>
          {I18n.t('back to our site')}
        </Button>
      </Link>
    </>
  );
};

export default memo(function Custom404() {
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
