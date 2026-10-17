import { Box, Divider, Paper, Skeleton, Stack } from '@mui/material';

const ROW_COUNT = 6;
const THUMBNAIL_SIZE = { xs: 80, sm: 100 };

function ChapterRow() {
  return (
    <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Skeleton variant="text" sx={{ typography: 'h6' }} />
        <Skeleton
          variant="text"
          width="40%"
          sx={{ typography: 'body2', mt: 0.5 }}
        />
        <Skeleton
          variant="text"
          width="30%"
          sx={{ typography: 'caption', mt: 1.5 }}
        />
      </Box>

      <Skeleton
        variant="rounded"
        sx={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE, flexShrink: 0 }}
      />
    </Box>
  );
}

export default function Loading() {
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="text" width={160} sx={{ typography: 'h5' }} />
      </Box>

      <Paper variant="outlined">
        <Stack divider={<Divider />}>
          {Array.from({ length: ROW_COUNT }).map((_, index) => (
            <ChapterRow
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
              key={`skeleton-chapter-${index}`}
            />
          ))}
        </Stack>
      </Paper>
    </>
  );
}
