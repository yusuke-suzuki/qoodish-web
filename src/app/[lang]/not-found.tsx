'use client';

import { KeyboardArrowLeft } from '@mui/icons-material';
import { Alert, AlertTitle, Button } from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Layout from '../../components/Layout';
import useDictionary from '../../hooks/useDictionary';

export default function NotFound() {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();

  return (
    <Layout>
      <Alert severity="warning">
        <AlertTitle>{dictionary['page not found']}</AlertTitle>
        {dictionary['page not found description']}
      </Alert>
      <Link href={`/${lang}/discover`} passHref>
        <Button color="primary" startIcon={<KeyboardArrowLeft />}>
          {dictionary['back to our site']}
        </Button>
      </Link>
    </Layout>
  );
}
