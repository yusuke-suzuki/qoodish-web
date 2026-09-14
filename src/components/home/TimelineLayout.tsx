import { Grid } from '@mui/material';
import { type ReactNode, Suspense } from 'react';
import { getServerAuthState } from '../../lib/auth.ts';
import { getPopularMaps, getRecommendMaps } from '../../lib/maps.ts';
import SectionErrorBoundary from '../common/SectionErrorBoundary.tsx';
import TimelineSidebar from './TimelineSidebar.tsx';

type Props = {
  children: ReactNode;
  lang: string;
};

async function SidebarSection({ lang }: { lang: string }) {
  const { token } = await getServerAuthState();

  const [popularMaps, recommendMaps] = await Promise.all([
    getPopularMaps(lang),
    // Without an account there is nothing to recommend from, and the guest
    // endpoint answers with a list that is recommended to nobody.
    token ? getRecommendMaps(lang, token) : undefined
  ]);

  return (
    <TimelineSidebar popularMaps={popularMaps} recommendMaps={recommendMaps} />
  );
}

export default function TimelineLayout({ children, lang }: Props) {
  return (
    <Grid container spacing={4}>
      <Grid size={{ xs: 12, md: 8 }}>{children}</Grid>

      <Grid size={{ md: 4 }} sx={{ display: { xs: 'none', md: 'block' } }}>
        {/* The rail is an aside, so the timeline is sent without waiting for
            it. Given nothing, the same component draws its own skeleton. */}
        <SectionErrorBoundary>
          <Suspense fallback={<TimelineSidebar />}>
            <SidebarSection lang={lang} />
          </Suspense>
        </SectionErrorBoundary>
      </Grid>
    </Grid>
  );
}
