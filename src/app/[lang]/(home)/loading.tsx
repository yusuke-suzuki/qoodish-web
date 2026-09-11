import { Container, Grid } from '@mui/material';
import TimelineSkeleton from '../../../components/home/TimelineSkeleton.tsx';

// The container and the column width are repeated from ContainedShell rather
// than reused: a Suspense fallback cannot await the sidebar the shell fetches.
export default function Loading() {
  return (
    <Container sx={{ py: { xs: 2, md: 4 } }}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, sm: 12, md: 8, lg: 8, xl: 8 }}>
          <TimelineSkeleton />
        </Grid>
      </Grid>
    </Container>
  );
}
