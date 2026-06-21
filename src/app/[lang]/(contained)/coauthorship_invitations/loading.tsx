import { Card, CardActions, CardHeader, Skeleton, Stack } from '@mui/material';

const PLACEHOLDER_COUNT = 5;

export default function Loading() {
  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      {Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
        <Card
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
          key={`skeleton-invitation-${index}`}
          variant="outlined"
        >
          <CardHeader
            avatar={<Skeleton variant="rounded" width={40} height={40} />}
            title={<Skeleton variant="text" width="60%" />}
            subheader={<Skeleton variant="text" width="40%" />}
          />
          <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
            <Skeleton variant="rounded" width={72} height={32} />
            <Skeleton variant="rounded" width={88} height={32} />
          </CardActions>
        </Card>
      ))}
    </Stack>
  );
}
