import { Box, Skeleton, Stack } from '@mui/material';

const summaryCardWidth = 360;
const bottomSheetHeight = 105;

export default function Loading() {
  return (
    <Box sx={{ display: { xs: 'block', md: 'flex' } }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          width: summaryCardWidth,
          height: '100dvh',
          p: 2
        }}
      >
        <Stack spacing={2}>
          <Skeleton variant="rectangular" height={160} />
          <Skeleton variant="text" height={32} width="70%" />
          <Skeleton variant="text" />
          <Skeleton variant="text" width="80%" />
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rounded" width={100} height={32} />
            <Skeleton variant="rounded" width={100} height={32} />
          </Stack>
          <Skeleton variant="rectangular" height={1} />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="rectangular" height={120} />
          <Skeleton variant="rectangular" height={120} />
        </Stack>
      </Box>

      <Skeleton
        variant="rectangular"
        sx={{
          height: {
            xs: `calc(100dvh - ${bottomSheetHeight}px - 56px)`,
            sm: `calc(100dvh - ${bottomSheetHeight}px - 64px)`,
            md: '100dvh'
          },
          width: {
            md: `calc(100dvw - ${summaryCardWidth}px)`
          },
          flexGrow: 1
        }}
      />

      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: bottomSheetHeight,
          bgcolor: 'background.paper'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.75 }}>
          <Skeleton variant="rounded" width={24} height={4} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 2,
            pb: 2
          }}
        >
          <Skeleton variant="rounded" width={64} height={64} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Skeleton variant="text" sx={{ fontSize: '1rem' }} width="70%" />
            <Skeleton
              variant="text"
              sx={{ fontSize: '0.875rem' }}
              width="40%"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
