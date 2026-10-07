import { Grid } from '@mui/material';
import TimelineSidebar from '../../../components/home/TimelineSidebar.tsx';
import TimelineSkeleton from '../../../components/home/TimelineSkeleton.tsx';
import ContainedShell from '../../../components/layouts/ContainedShell.tsx';

export default function Loading() {
  return (
    <ContainedShell>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <TimelineSkeleton />
        </Grid>

        <Grid size={{ md: 4 }} sx={{ display: { xs: 'none', md: 'block' } }}>
          <TimelineSidebar />
        </Grid>
      </Grid>
    </ContainedShell>
  );
}
