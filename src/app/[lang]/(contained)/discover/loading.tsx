import { Box, Divider, Grid, Paper, Skeleton, Stack } from '@mui/material';

const TILE_COUNT = 6;
const CHAPTER_ROW_COUNT = 3;

// The same sizes the lists themselves take, so nothing jumps when the data
// lands: a wide cover for the pick up, square photographs under two lines of
// text for reports, wide covers for maps, ruled rows for chapters.
const REPORT_SIZE = { xs: 6, sm: 4, md: 3 };
const MAP_SIZE = { xs: 12, sm: 6, lg: 4 };
// Skeleton keeps a 1.2em height unless it is cleared, which would override
// the aspect ratio.
const COVER = {
  height: 'auto',
  aspectRatio: '16 / 9',
  maxHeight: { xs: 220, sm: 320, md: 400 }
};
const CHAPTER_THUMBNAIL = { xs: 80, sm: 100 };

function SectionHeader() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <Skeleton variant="circular" width={24} height={24} />
      <Skeleton variant="text" width={120} />
    </Box>
  );
}

type GridSectionProps = {
  keyPrefix: string;
  aspectRatio: string;
  size: Record<string, number>;
  captioned?: boolean;
};

function GridSection({
  keyPrefix,
  aspectRatio,
  size,
  captioned
}: GridSectionProps) {
  return (
    <Box component="section">
      <SectionHeader />

      <Grid container spacing={2}>
        {Array.from({ length: TILE_COUNT }).map((_, index) => (
          <Grid
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            key={`${keyPrefix}-${index}`}
            size={size}
          >
            <Skeleton variant="rounded" sx={{ height: 'auto', aspectRatio }} />

            {captioned && (
              <>
                <Skeleton
                  variant="text"
                  width="80%"
                  sx={{ typography: 'subtitle2', mt: 1 }}
                />
                <Skeleton
                  variant="text"
                  width="50%"
                  sx={{ typography: 'caption' }}
                />
              </>
            )}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

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
        sx={{
          width: CHAPTER_THUMBNAIL,
          height: CHAPTER_THUMBNAIL,
          flexShrink: 0
        }}
      />
    </Box>
  );
}

export default function Loading() {
  return (
    <>
      <Skeleton
        variant="text"
        width={160}
        sx={{ typography: 'h4', mb: { xs: 4, sm: 6 } }}
      />

      <Stack spacing={{ xs: 4, sm: 6 }}>
        <Box component="section">
          <SectionHeader />
          <Skeleton variant="rounded" sx={COVER} />
        </Box>

        <GridSection
          keyPrefix="skeleton-discover-recent-pins"
          aspectRatio="1 / 1"
          size={REPORT_SIZE}
          captioned
        />

        <Box component="section">
          <SectionHeader />

          <Paper variant="outlined">
            <Stack divider={<Divider />}>
              {Array.from({ length: CHAPTER_ROW_COUNT }).map((_, index) => (
                <ChapterRow
                  // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
                  key={`skeleton-discover-recent-chapters-${index}`}
                />
              ))}
            </Stack>
          </Paper>
        </Box>

        <GridSection
          keyPrefix="skeleton-discover-active-maps"
          aspectRatio="16 / 9"
          size={MAP_SIZE}
        />

        <GridSection
          keyPrefix="skeleton-discover-recent-maps"
          aspectRatio="16 / 9"
          size={MAP_SIZE}
        />
      </Stack>
    </>
  );
}
