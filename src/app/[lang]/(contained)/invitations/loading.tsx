import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton
} from '@mui/material';

const PLACEHOLDER_COUNT = 5;

export default function Loading() {
  return (
    <List>
      {Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
        <ListItem
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
          key={`skeleton-invitation-${index}`}
          alignItems="flex-start"
          secondaryAction={
            <Skeleton variant="rounded" width={120} height={32} />
          }
        >
          <ListItemAvatar>
            <Skeleton variant="rounded" width={40} height={40} />
          </ListItemAvatar>
          <ListItemText
            disableTypography
            primary={<Skeleton variant="text" width="60%" />}
            secondary={<Skeleton variant="text" width="40%" />}
          />
        </ListItem>
      ))}
    </List>
  );
}
