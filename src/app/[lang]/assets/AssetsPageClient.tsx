'use client';

import { Map as MapIcon } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
import html2canvas from 'html2canvas';
import { useParams } from 'next/navigation';
import { type RefObject, useCallback, useRef } from 'react';
import Layout from '../../../components/Layout';
import useDictionary from '../../../hooks/useDictionary';

export default function AssetsPageClient() {
  const iconRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const { lang } = useParams<{ lang: string }>();
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

  return (
    <Layout>
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
              handleConvertToImage(logoRef, `ogp-image-${lang}-2023-09-12.webp`)
            }
          >
            Download
          </Button>
        </Stack>
      </Box>
    </Layout>
  );
}
