'use client';

import { KeyboardArrowLeft } from '@mui/icons-material';
import { Alert, AlertTitle, Button } from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { AppMap, Profile } from '../../../../../types';
import Layout from '../../../../components/Layout';
import Sidebar from '../../../../components/layouts/Sidebar';
import UserProfile from '../../../../components/profiles/UserProfile';
import useDictionary from '../../../../hooks/useDictionary';

type Props = {
  profile: Profile | null;
  popularMaps: AppMap[];
};

export default function UserPageClient({ profile, popularMaps }: Props) {
  const { lang, userId } = useParams<{ lang: string; userId: string }>();
  const dictionary = useDictionary();

  const sidebar = <Sidebar popularMaps={popularMaps} />;

  if (!profile) {
    return (
      <Layout sidebar={sidebar}>
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
    <Layout sidebar={sidebar}>
      <UserProfile id={Number(userId)} />
    </Layout>
  );
}
