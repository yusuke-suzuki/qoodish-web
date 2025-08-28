import { Map as MapIcon } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
import html2canvas from 'html2canvas';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { type ReactElement, type RefObject, useCallback, useRef } from 'react';
import Layout from '../components/Layout';
import useDictionary from '../hooks/useDictionary';
import type { NextPageWithLayout } from './_app';

const AssetsPage: NextPageWithLayout = () => {
  const iconRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const dictionary = useDictionary();

  const handleConvertToImage = useCallback(
    async (ref: RefObject<HTMLDivElement>, fileName: string) => {
      if (!ref.current) {
        return;
      }

      const canvas = await html2canvas(ref.current);
      const link = document.createElement('a');

      link.download = fileName;
      link.href = canvas.toDataURL('image/webp');

      link.click();
    },
    []
  );

  const title = 'Assets | Qoodish';
  const description = dictionary['meta description'];
  const basePath =
    router.locale === router.defaultLocale ? '' : `/${router.locale}`;
  const thumbnailUrl =
    router.locale === router.defaultLocale
      ? process.env.NEXT_PUBLIC_OGP_IMAGE_URL_EN
      : process.env.NEXT_PUBLIC_OGP_IMAGE_URL_JA;

  return (
    <>
      <Head>
        <title>{title}</title>

        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}`}
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}`}
          hrefLang="en"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}`}
          hrefLang="ja"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}`}
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
          content={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}`}
        />
        <meta property="og:image" content={thumbnailUrl} />

        <meta name="twitter:card" content="summary_large_image" />

        <meta property="og:locale" content={router.locale} />
        <meta property="og:site_name" content={dictionary['meta headline']} />
      </Head>

      <Box>
        <Stack spacing={2}>
          <Box
            ref={iconRef}
            sx={{
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'primary.main',
              height: 512,
              width: 512
            }}
          >
            <Typography
              color="background.paper"
              sx={{
                fontFamily: "'Lobster', cursive",
                fontSize: 320
              }}
            >
              Q
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => handleConvertToImage(iconRef, 'app-icon.webp')}
          >
            Download
          </Button>
        </Stack>

        <Stack spacing={2}>
          <Box
            ref={logoRef}
            sx={{
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'background.paper',
              width: 1200,
              height: 630
            }}
          >
            <Box sx={{ display: 'grid', placeItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MapIcon color="primary" sx={{ fontSize: 240 }} />

                <Typography
                  sx={{
                    fontFamily: "'Lobster', cursive",
                    fontSize: 200
                  }}
                >
                  Qoodish
                </Typography>
              </Box>

              <Typography
                color="inherit"
                sx={{
                  fontSize: 64
                }}
              >
                {dictionary['create map together']}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            onClick={() =>
              handleConvertToImage(
                logoRef,
                `ogp-image-${router.locale}-2023-09-12.webp`
              )
            }
          >
            Download
          </Button>
        </Stack>
      </Box>
    </>
  );
};

AssetsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default AssetsPage;
