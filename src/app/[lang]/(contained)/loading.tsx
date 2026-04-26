import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Skeleton
} from '@mui/material';

const PLACEHOLDER_COUNT = 3;

export default function Loading() {
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      {Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
        <Card
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
          key={`home-skeleton-${index}`}
          elevation={0}
        >
          <CardHeader
            avatar={<Skeleton variant="circular" width={40} height={40} />}
            title={<Skeleton width="40%" />}
            subheader={<Skeleton width="25%" />}
          />
          <CardContent sx={{ pt: 0 }}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="90%" />
          </CardContent>
          <CardActions>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </CardActions>
        </Card>
      ))}
    </Box>
  );
}
