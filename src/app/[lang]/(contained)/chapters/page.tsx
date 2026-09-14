import { HistoryEdu } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import type { Metadata } from 'next';
import ChapterFeed from '../../../../components/chapters/ChapterFeed.tsx';
import { getChapterFeed } from '../../../../lib/chapters.ts';
import { getDictionary } from '../../../../utils/getDictionary.ts';
import { localePath } from '../../../../utils/locales.ts';
import {
  buildAlternates,
  defaultOgImage,
  ogImages
} from '../../../../utils/metadata.ts';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const title = `${dict['recent chapters']} | Qoodish`;
  const description = dict['meta description'];

  return {
    title,
    description,
    alternates: buildAlternates(lang, '/chapters'),
    openGraph: {
      type: 'website',
      title,
      description,
      url: localePath(lang, '/chapters'),
      images: ogImages(defaultOgImage(lang), dict['meta headline']),
      locale: lang === 'en' ? 'en_US' : 'ja_JP',
      siteName: dict['meta headline']
    },
    twitter: {
      card: 'summary_large_image'
    }
  };
}

export default async function ChaptersPage({ params }: Props) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const chapters = await getChapterFeed(lang);

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <HistoryEdu color="secondary" />
        <Typography variant="h5" component="h1">
          {dict['recent chapters']}
        </Typography>
      </Box>

      <ChapterFeed initialChapters={chapters} />
    </>
  );
}
