import { Box, Container, Grid } from '@mui/material';
import { type ReactNode, Suspense } from 'react';
import BottomNav from '../../../components/layouts/BottomNav';
import Sidebar from '../../../components/layouts/Sidebar';
import { getServerAuthState } from '../../../lib/auth';
import { getPopularMaps, getRecommendMaps } from '../../../lib/maps';

type Props = {
  children: ReactNode;
  params: Promise<{ lang: string }>;
};

async function SidebarData({ lang }: { lang: string }) {
  const { token } = await getServerAuthState();
  const [popularMaps, recommendMaps] = await Promise.all([
    getPopularMaps(lang),
    getRecommendMaps(lang, token)
  ]);

  return <Sidebar popularMaps={popularMaps} recommendMaps={recommendMaps} />;
}

export default async function ContainedLayout({ children, params }: Props) {
  const { lang } = await params;

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
              <Suspense fallback={<Sidebar />}>
                <SidebarData lang={lang} />
              </Suspense>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <BottomNav />
    </>
  );
}
