import {
  Box,
  CardActions,
  CardContent,
  Divider,
  Skeleton,
  SwipeableDrawer,
  Typography
} from '@mui/material';
import { memo, useCallback, useState } from 'react';
import type { AppMap, Profile, Review } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import { useMapReviews } from '../../hooks/useMapReviews';
import FollowButton from './FollowButton';
import Followers from './Followers';
import MapCardHeader from './MapCardHeader';
import MapMenuButton from './MapMenuButton';
import MapReviewList from './MapReviewList';
import MobileMiniMapHeader from './MobileMiniMapHeader';
import UnfollowButton from './UnfollowButton';

const drawerBleeding = 105;

type Props = {
  map: AppMap | null;
  currentProfile: Profile | null;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onReportClick: () => void;
  onSaved: () => void;
  onReviewClick: (review: Review) => void;
  reviewDrawerOpen: boolean;
};

function MobileMapDrawer({
  map,
  currentProfile,
  onEditClick,
  onDeleteClick,
  onReportClick,
  onSaved,
  onReviewClick,
  reviewDrawerOpen
}: Props) {
  const [open, setOpen] = useState(false);

  const dictionary = useDictionary();
  const { reviews, isLoading } = useMapReviews(map ? map.id : null);

  const handleReviewClick = useCallback(
    (review: Review) => {
      onReviewClick(review);
    },
    [onReviewClick]
  );

  return (
    <>
      <SwipeableDrawer
        anchor="bottom"
        variant="temporary"
        hideBackdrop
        disableSwipeToOpen={false}
        open={reviewDrawerOpen ? false : open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        swipeAreaWidth={drawerBleeding}
        ModalProps={{
          keepMounted: true
        }}
        PaperProps={{
          sx: {
            height: `calc(100% - ${drawerBleeding}px)`,
            overflow: 'visible'
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -drawerBleeding,
            visibility: 'visible',
            right: 0,
            left: 0,
            bgcolor: 'background.paper',
            height: drawerBleeding
          }}
        >
          <MobileMiniMapHeader
            map={map}
            reviews={reviews}
            draggable
            sx={{ pt: 0 }}
          />
        </Box>
        <Divider />
        <Box sx={{ overflowY: 'auto' }}>
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
            <Typography variant="subtitle2" component="h2" gutterBottom>
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
              <Typography variant="subtitle2" component="h2">
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

            <MapReviewList
              reviews={reviews}
              isLoading={isLoading}
              onReviewClick={handleReviewClick}
            />
          </CardContent>
        </Box>
      </SwipeableDrawer>
    </>
  );
}

export default memo(MobileMapDrawer);
