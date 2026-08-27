import { Box, Divider, Paper, Skeleton } from '@mui/material';
import { coverAspectRatio } from '../../../../../components/chapters/constants.ts';

const ENTRY_COUNT = 3;

export default function Loading() {
  return (
    <Paper elevation={0} sx={{ overflow: 'hidden' }}>
      {/* Skeleton keeps a 1.2em height unless it is cleared, which would
          override the aspect ratio. */}
      <Skeleton
        variant="rectangular"
        sx={{ width: '100%', height: 'auto', aspectRatio: coverAspectRatio }}
      />

      <Box sx={{ px: { xs: 2.5, sm: 5 }, py: { xs: 4, sm: 6 } }}>
        <Skeleton
          variant="rounded"
          width={120}
          height={32}
          sx={{ borderRadius: 4, mb: 2 }}
        />

        <Skeleton variant="text" width="60%" height={48} sx={{ mb: 1 }} />

        <Skeleton variant="text" width={140} sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width="30%" />
        </Box>

        <Divider sx={{ mb: 4 }} />

        {Array.from({ length: ENTRY_COUNT }).map((_, index) => (
          <Box
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            key={`skeleton-journal-entry-${index}`}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4
            }}
          >
            <Skeleton
              variant="rectangular"
              sx={{
                width: '100%',
                maxWidth: 360,
                height: 'auto',
                aspectRatio: '4 / 3',
                mb: 1
              }}
            />
            <Skeleton variant="text" width="40%" sx={{ mb: 2 }} />
            <Skeleton variant="text" sx={{ width: '100%' }} />
            <Skeleton variant="text" sx={{ width: '80%' }} />
          </Box>
        ))}

        <Divider sx={{ mt: 6, mb: 4 }} />

        <Skeleton variant="rounded" height={240} sx={{ mb: 3 }} />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Skeleton variant="rounded" width={56} height={56} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" height={28} />
            <Skeleton variant="text" width="80%" />
          </Box>
        </Box>

        <Divider sx={{ mt: 6, mb: 4 }} />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Skeleton variant="circular" width={56} height={56} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" height={28} />
            <Skeleton variant="text" width="20%" />
            <Skeleton variant="text" width="80%" />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
