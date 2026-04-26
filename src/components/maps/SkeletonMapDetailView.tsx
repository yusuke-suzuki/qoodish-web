import { Box, Skeleton, Stack } from '@mui/material';
import { memo } from 'react';

const summaryCardWidth = 360;
const bottomSheetHeight = 105;

function SkeletonMapDetailView() {
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
          bottom: { xs: 56, sm: 64 },
          left: 0,
          right: 0,
          height: bottomSheetHeight,
          bgcolor: 'background.paper',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          p: 2
        }}
      >
        <Stack spacing={1}>
          <Skeleton variant="text" width="60%" height={28} />
          <Skeleton variant="text" width="40%" />
        </Stack>
      </Box>
    </Box>
  );
}

export default memo(SkeletonMapDetailView);
