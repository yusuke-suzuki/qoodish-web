import { List, ListItem, Paper, Skeleton, Stack } from '@mui/material';

const ROW_COUNT = 5;

export default function Loading() {
  return (
    <Paper elevation={0}>
      <List disablePadding>
        {Array.from({ length: ROW_COUNT }).map((_, index) => (
          <ListItem
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            key={`skeleton-journey-${index}`}
            divider={index < ROW_COUNT - 1}
          >
            <Skeleton
              variant="circular"
              width={24}
              height={24}
              sx={{ mr: 2, flexShrink: 0 }}
            />
            <Stack spacing={0.5} sx={{ flex: 1 }}>
              <Skeleton variant="text" width="55%" />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="30%" />
            </Stack>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
