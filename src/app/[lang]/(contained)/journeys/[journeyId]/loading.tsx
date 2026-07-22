import { Box, Card, CardContent, Paper, Skeleton } from '@mui/material';

const CHECKIN_ROW_COUNT = 4;

export default function Loading() {
  return (
    <>
      <Paper elevation={0} sx={{ overflow: 'hidden' }}>
        <Skeleton
          variant="rectangular"
          sx={{ width: '100%', height: { xs: 260, sm: 320 } }}
        />

        <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Skeleton
            variant="rounded"
            width={120}
            height={32}
            sx={{ borderRadius: 4, mb: 2 }}
          />

          <Skeleton variant="text" width="45%" height={28} />
          <Skeleton variant="text" width="30%" sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
            <Box>
              <Skeleton variant="text" width={40} height={32} />
              <Skeleton variant="text" width={64} />
            </Box>
            <Box>
              <Skeleton variant="text" width={40} height={32} />
              <Skeleton variant="text" width={32} />
            </Box>
          </Box>

          {Array.from({ length: CHECKIN_ROW_COUNT }).map((_, index) => (
            <Box
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
              key={`skeleton-journey-checkin-${index}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 3,
                px: 2
              }}
            >
              <Skeleton variant="text" width={48} />
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="text" sx={{ flex: 1 }} />
            </Box>
          ))}
        </Box>
      </Paper>

      <Card elevation={0} sx={{ mt: 2 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Skeleton variant="circular" width={24} height={24} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="50%" />
            <Skeleton variant="text" width="30%" />
          </Box>
          <Skeleton variant="circular" width={20} height={20} />
        </CardContent>
      </Card>
    </>
  );
}
