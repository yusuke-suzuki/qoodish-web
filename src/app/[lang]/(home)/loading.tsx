import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Skeleton
} from '@mui/material';

const PLACEHOLDER_COUNT = 3;

// The container and the column width are repeated from ContainedShell rather
// than reused: a Suspense fallback cannot await the sidebar the shell fetches.
export default function Loading() {
  return (
    <Container sx={{ py: { xs: 2, md: 4 } }}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, sm: 12, md: 8, lg: 8, xl: 8 }}>
          <Box sx={{ display: 'grid', gap: 3 }}>
            {Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
              <Card
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
                key={`skeleton-review-card-${index}`}
                elevation={0}
              >
                <CardHeader
                  avatar={
                    <Skeleton variant="circular" width={40} height={40} />
                  }
                  title={<Skeleton width="40%" />}
                  subheader={<Skeleton width="25%" />}
                  action={
                    <Skeleton variant="circular" width={32} height={32} />
                  }
                />
                <CardContent sx={{ pt: 0 }}>
                  <Skeleton variant="text" height={32} width="60%" />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="80%" />
                </CardContent>
                <Skeleton variant="rectangular" height={240} />
                <CardActions>
                  <Skeleton variant="circular" width={32} height={32} />
                  <Skeleton variant="circular" width={32} height={32} />
                </CardActions>
              </Card>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
