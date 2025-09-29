import {
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
  Paper,
  Skeleton
} from '@mui/material';
import { memo } from 'react';

const SkeletonTrendingList = () => {
  return (
    <Paper elevation={0}>
      <CardContent>
        <List
          disablePadding
          subheader={
            <ListSubheader disableGutters>
              <Skeleton height={28} width="60%" />
            </ListSubheader>
          }
        >
          {Array.from(new Array(10)).map((_v, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: The list is static and does not require a unique key.
            <ListItem key={`skeleton-trending-${i}`}>
              <ListItemAvatar>
                <Skeleton variant="circular" width={40} height={40} />
              </ListItemAvatar>
              <ListItemText
                disableTypography
                primary={<Skeleton height={28} width="100%" />}
                secondary={<Skeleton height={24} width="100%" />}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Paper>
  );
};

export default memo(SkeletonTrendingList);
