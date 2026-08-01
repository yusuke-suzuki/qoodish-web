import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Skeleton,
  Typography
} from '@mui/material';
import { memo } from 'react';

export default memo(function TimelineReviewCardSkeleton() {
  return (
    <Card elevation={0}>
      <CardHeader
        avatar={<Skeleton variant="circular" width={40} height={40} />}
        title={<Skeleton variant="text" width="40%" />}
        subheader={<Skeleton variant="text" width="25%" />}
      />
      <CardContent sx={{ pt: 0 }}>
        <Typography variant="h5" component="div" gutterBottom>
          <Skeleton variant="text" width="60%" />
        </Typography>

        <Skeleton variant="text" />
        <Skeleton variant="text" width="80%" />
      </CardContent>
      <CardActions>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="circular" width={40} height={40} />
      </CardActions>
    </Card>
  );
});
