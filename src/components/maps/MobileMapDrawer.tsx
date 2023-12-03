import {
  Box,
  CardActions,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Typography,
  css
} from '@mui/material';
import { memo, useCallback, useRef } from 'react';
import Sheet, { SheetRef } from 'react-modal-sheet';
import { AppMap, Profile, Review } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import { useMapReviews } from '../../hooks/useMapReviews';
import FollowButton from './FollowButton';
import Followers from './Followers';
import MapCardHeader from './MapCardHeader';
import MapMenuButton from './MapMenuButton';
import MapReviewList from './MapReviewList';
import MobileMiniMapHeader from './MobileMiniMapHeader';
import UnfollowButton from './UnfollowButton';

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

const snapPoints = [0.9, 0.5, 136];
const initialSnap = 2;

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
  const dictionary = useDictionary();
  const { reviews, isLoading } = useMapReviews(map ? map.id : null);

  const sheetRef = useRef<SheetRef>();

  const handleClose = useCallback(() => {
    sheetRef.current.snapTo(2);
  }, []);

  const handleReviewClick = useCallback(
    (review: Review) => {
      onReviewClick(review);
      sheetRef.current.snapTo(0);
    },
    [onReviewClick]
  );

  return (
    <>
      <Sheet
        ref={sheetRef}
        isOpen={reviewDrawerOpen ? false : true}
        onClose={handleClose}
        snapPoints={snapPoints}
        initialSnap={initialSnap}
        css={css`
          z-index: 1100 !important;
        `}
      >
        <Sheet.Container>
          <Sheet.Header>
            <MobileMiniMapHeader
              map={map}
              reviews={reviews}
              draggable
              sx={{ pt: 0 }}
            />
          </Sheet.Header>
          <Sheet.Content>
            <Sheet.Scroller>
              <Divider />
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
                <List disablePadding dense>
                  <ListItem disableGutters>
                    <ListItemText primary={dictionary.followers} />
                    <Followers map={map} />
                  </ListItem>
                </List>
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
            </Sheet.Scroller>
          </Sheet.Content>
        </Sheet.Container>
      </Sheet>
    </>
  );
}

export default memo(MobileMapDrawer);
