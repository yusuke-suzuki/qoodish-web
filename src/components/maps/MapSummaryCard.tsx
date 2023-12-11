import { Photo } from '@mui/icons-material';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Divider,
  Skeleton,
  Typography
} from '@mui/material';
import { memo } from 'react';
import { AppMap, Profile } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import { useMapReviews } from '../../hooks/useMapReviews';
import FollowButton from './FollowButton';
import Followers from './Followers';
import MapCardHeader from './MapCardHeader';
import MapMenuButton from './MapMenuButton';
import MapReviewList from './MapReviewList';
import PrivateMapChip from './PrivateMapChip';
import UnfollowButton from './UnfollowButton';

type Props = {
  map: AppMap | null;
  currentProfile: Profile | null;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onReportClick: () => void;
  onSaved: () => void;
};

export default memo(function MapSummaryCard({
  map,
  currentProfile,
  onEditClick,
  onDeleteClick,
  onReportClick,
  onSaved
}: Props) {
  const dictionary = useDictionary();
  const { reviews, isLoading } = useMapReviews(map ? map.id : null);

  return (
    <Card sx={{ height: '100%', width: '100%', overflowY: 'auto' }}>
      {map?.thumbnail_url ? (
        <CardMedia
          component="img"
          alt={map.name}
          image={map.thumbnail_url_400}
          width={1200}
          height={630}
          sx={{
            height: 180
          }}
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            placeContent: 'center',
            bgcolor: 'background.paper',
            width: '100%',
            height: 180
          }}
        >
          <Photo color="disabled" fontSize="large" />
        </Box>
      )}
      <CardContent sx={{ pb: 0 }}>
        {map ? (
          <Typography
            variant="h5"
            component="h1"
            fontWeight={600}
            gutterBottom={map?.private}
          >
            {map.name}
          </Typography>
        ) : (
          <Skeleton height={70} />
        )}

        {map?.private && <PrivateMapChip />}
      </CardContent>
      <MapCardHeader
        map={map}
        action={
          <MapMenuButton
            map={map}
            currentProfile={currentProfile}
            onReportClick={onReportClick}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
          />
        }
      />
      <CardContent sx={{ pt: 0, pb: map?.editable ? 2 : 0 }}>
        {map ? (
          <Typography variant="body1">{map.description}</Typography>
        ) : (
          <>
            <Skeleton />
            <Skeleton />
          </>
        )}
      </CardContent>
      {map?.editable ? null : (
        <CardActions sx={{ p: 2 }}>
          {map?.following ? (
            <UnfollowButton
              map={map}
              currentProfile={currentProfile}
              onSaved={onSaved}
            />
          ) : (
            <FollowButton map={map} onSaved={onSaved} />
          )}
        </CardActions>
      )}
      <Divider />
      <CardContent>
        <Typography variant="subtitle1" component="h2" gutterBottom>
          {dictionary.followers}
        </Typography>
        <Box sx={{ display: 'flex' }}>
          <Followers map={map} />
        </Box>
      </CardContent>
      <Divider />
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="h6" component="h2">
            {dictionary.spots}
          </Typography>

          <Typography
            variant="subtitle1"
            component="div"
            color="text.secondary"
          >
            {reviews.length}
          </Typography>
        </Box>

        <MapReviewList reviews={reviews} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
});
