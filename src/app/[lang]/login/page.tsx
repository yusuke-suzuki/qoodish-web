import { Container, Stack, Typography } from '@mui/material';
import type { Metadata } from 'next';
import LoginCard from '../../../components/auth/LoginCard.tsx';
import Footer from '../../../components/layouts/Footer.tsx';
import { getDictionary } from '../../../utils/getDictionary.ts';
import { localePath } from '../../../utils/locales.ts';
import {
  buildAlternates,
  defaultOgImage,
  ogImages
} from '../../../utils/metadata.ts';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const title = `${dict.login} | Qoodish`;
  const description = dict['meta description'];
  const thumbnailUrl = defaultOgImage(lang);

  return {
    title,
    description,
    keywords:
      'Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, maps, travel, food, group, trip',
    alternates: buildAlternates(lang, '/login'),
    openGraph: {
      type: 'website',
      title,
      description,
      url: localePath(lang, '/login'),
      images: ogImages(thumbnailUrl),
      locale: lang === 'en' ? 'en_US' : 'ja_JP',
      siteName: dict['meta headline']
    },
    twitter: {
      card: 'summary_large_image'
    }
  };
}

export default async function LoginPage({ params }: Props) {
  const { lang } = await params;
  const dict = getDictionary(lang);

  return (
    <>
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
        <Stack spacing={4}>
          <Typography
            variant="h4"
            component="h1"
            align="center"
            sx={{ typography: { md: 'h3' } }}
          >
            {dict['start new adventure']}
          </Typography>

          <LoginCard />
        </Stack>
      </Container>

      <Footer />
    </>
  );
}
