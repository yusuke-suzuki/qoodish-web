import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Skeleton
} from '@mui/material';

export default function Loading() {
  return (
    <>
      <Card elevation={0}>
        <CardHeader
          avatar={<Skeleton variant="circular" width={40} height={40} />}
          title={<Skeleton width="40%" />}
          subheader={<Skeleton width="25%" />}
          action={<Skeleton variant="circular" width={32} height={32} />}
        />
        <CardContent sx={{ py: 0 }}>
          <Skeleton variant="text" height={36} width="60%" />
          <Skeleton variant="text" />
          <Skeleton variant="text" />
          <Skeleton variant="text" width="80%" />
          <Box sx={{ mt: 2 }}>
            <Skeleton variant="rectangular" height={320} />
          </Box>
        </CardContent>
        <CardActions>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="rounded" width={120} height={32} sx={{ ml: 1 }} />
        </CardActions>
      </Card>

      <Box sx={{ mt: 2 }}>
        <Skeleton variant="rounded" width={120} height={32} />
      </Box>
    </>
  );
}
