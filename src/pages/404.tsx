import { KeyboardArrowLeft } from '@mui/icons-material';
import { Alert, AlertTitle, Button } from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';
import { memo } from 'react';
import useDictionary from '../hooks/useDictionary';

const NotFound = () => {
  const dictionary = useDictionary();

  return (
    <>
      <Alert severity="warning">
        <AlertTitle>{dictionary['page not found']}</AlertTitle>
        {dictionary['page not found description']}
      </Alert>
      <Link href="/discover" passHref>
        <Button color="primary" startIcon={<KeyboardArrowLeft />}>
          {dictionary['back to our site']}
        </Button>
      </Link>
    </>
  );
};

export default memo(function Custom404() {
  const dictionary = useDictionary();

  return (
    <>
      <Head>
        <title>{`${dictionary['page not found']} | Qoodish`}</title>
        <meta name="robots" content="noindex" />
      </Head>

      <NotFound />
    </>
  );
});
