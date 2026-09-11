import { Container, Grid } from '@mui/material';
import type { ReactNode } from 'react';
import { getServerAuthState } from '../../lib/auth.ts';
import { getPopularMaps, getRecommendMaps } from '../../lib/maps.ts';
import BottomNav from './BottomNav.tsx';
import Footer from './Footer.tsx';
import Sidebar from './Sidebar.tsx';

type Props = {
  children: ReactNode;
  lang: string;
};

export default async function ContainedShell({ children, lang }: Props) {
  const { token } = await getServerAuthState();
  const [popularMaps, recommendMaps] = await Promise.all([
    getPopularMaps(lang),
    // Without an account there is nothing to recommend from, and the guest
    // endpoint answers with a list that is recommended to nobody.
    token ? getRecommendMaps(lang, token) : undefined
  ]);

  return (
    <>
      <Container sx={{ py: { xs: 2, md: 4 } }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 12, md: 8, lg: 8, xl: 8 }}>{children}</Grid>

          <Grid
            size={{ md: 4, lg: 4, xl: 4 }}
            sx={{ display: { xs: 'none', md: 'block' } }}
          >
            <Sidebar popularMaps={popularMaps} recommendMaps={recommendMaps} />
          </Grid>
        </Grid>
      </Container>

      <Footer />

      <BottomNav />
    </>
  );
}
