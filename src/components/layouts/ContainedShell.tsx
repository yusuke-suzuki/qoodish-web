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
  // The landing page turns this off: a rail of the app's own maps beside the
  // pitch reads as though the reader were already inside the app, and the two
  // requests behind it are spent on someone who has not asked for them.
  sidebar?: boolean;
};

export default async function ContainedShell({
  children,
  lang,
  sidebar = true
}: Props) {
  const { token } = await getServerAuthState();

  const [popularMaps, recommendMaps] = sidebar
    ? await Promise.all([
        getPopularMaps(lang),
        // Without an account there is nothing to recommend from, and the guest
        // endpoint answers with a list that is recommended to nobody.
        token ? getRecommendMaps(lang, token) : undefined
      ])
    : [undefined, undefined];

  return (
    <>
      <Container sx={{ py: { xs: 2, md: 4 } }}>
        <Grid container spacing={4}>
          <Grid
            size={{ xs: 12, sm: 12, md: sidebar ? 8 : 10 }}
            offset={{ md: sidebar ? 0 : 1 }}
          >
            {children}
          </Grid>

          {sidebar && (
            <Grid
              size={{ md: 4, lg: 4, xl: 4 }}
              sx={{ display: { xs: 'none', md: 'block' } }}
            >
              <Sidebar
                popularMaps={popularMaps}
                recommendMaps={recommendMaps}
              />
            </Grid>
          )}
        </Grid>
      </Container>

      <Footer />

      <BottomNav />
    </>
  );
}
