import { Card, CardActions, CardContent, Skeleton, Stack } from '@mui/material';

const CARD_COUNT = 4;

export default function Loading() {
  return (
    <Stack spacing={3}>
      {Array.from({ length: CARD_COUNT }).map((_, index) => (
        <Card
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
          key={`skeleton-settings-card-${index}`}
        >
          <CardContent>
            <Skeleton variant="text" width="40%" height={40} />
            <Skeleton variant="text" />
            <Skeleton variant="text" width="80%" />
          </CardContent>
          <CardActions>
            <Skeleton variant="rounded" width={120} height={32} />
          </CardActions>
        </Card>
      ))}
    </Stack>
  );
}
