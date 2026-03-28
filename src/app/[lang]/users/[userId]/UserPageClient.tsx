'use client';

import { KeyboardArrowLeft } from '@mui/icons-material';
import { Alert, AlertTitle, Button } from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Profile } from '../../../../../types';
import Layout from '../../../../components/Layout';
import UserProfile from '../../../../components/profiles/UserProfile';
import useDictionary from '../../../../hooks/useDictionary';

type Props = {
  profile: Profile | null;
};

export default function UserPageClient({ profile }: Props) {
  const { lang, userId } = useParams<{ lang: string; userId: string }>();
  const dictionary = useDictionary();

  if (!profile) {
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

  return (
    <Layout>
      <UserProfile id={Number(userId)} />
    </Layout>
  );
}
