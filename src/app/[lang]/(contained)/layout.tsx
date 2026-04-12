import { Box, Container, Grid } from '@mui/material';
import type { ReactNode } from 'react';
import BottomNav from '../../../components/layouts/BottomNav';
import Sidebar from '../../../components/layouts/Sidebar';
import { getPopularMaps } from '../../../lib/maps';

type Props = {
  children: ReactNode;
  params: Promise<{ lang: string }>;
};

export default async function ContainedLayout({ children, params }: Props) {
  const { lang } = await params;
  const popularMaps = await getPopularMaps(lang);

  return (
    <>
      <Box sx={{ pb: { xs: 7, md: 0 } }}>
        <Container sx={{ py: { xs: 2, md: 4 } }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 12, md: 8, lg: 8, xl: 8 }}>
              {children}
            </Grid>

            <Grid
              size={{ md: 4, lg: 4, xl: 4 }}
              sx={{ display: { xs: 'none', md: 'block' } }}
            >
              <Sidebar popularMaps={popularMaps} />
            </Grid>
          </Grid>
        </Container>
      </Box>
      <BottomNav />
    </>
  );
}
