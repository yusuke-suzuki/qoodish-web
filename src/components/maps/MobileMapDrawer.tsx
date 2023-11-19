import {
  Avatar,
  Box,
  CardActions,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Stack,
  Typography
} from '@mui/material';
import { memo, useCallback, useRef } from 'react';
import { BottomSheet, BottomSheetRef } from 'react-spring-bottom-sheet';
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

function MobileMapDrawer({
  map,
  currentProfile,
  onEditClick,
  onDeleteClick,
  onReportClick,
  onSaved
}: Props) {
  const dictionary = useDictionary();
  const { reviews, isLoading } = useMapReviews(map ? map.id : null);

  const focusRef = useRef<HTMLButtonElement>();
  const sheetRef = useRef<BottomSheetRef>();

  const handleReviewClick = useCallback(() => {
    sheetRef.current.snapTo(({ maxHeight }) => maxHeight / 4);
  }, []);

  return (
    <>
      <BottomSheet
        open
        blocking={false}
        skipInitialTransition
        expandOnContentDrag
        ref={sheetRef}
        initialFocusRef={focusRef}
        defaultSnap={({ maxHeight }) => maxHeight / 4}
        snapPoints={({ maxHeight }) => [
          maxHeight - maxHeight / 10,
          120,
          maxHeight * 0.6
        ]}
        header={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 1,
              textAlign: 'left'
            }}
            onClick={() =>
              sheetRef.current.snapTo(({ maxHeight }) => maxHeight / 2)
            }
          >
            {map ? (
              <Avatar
                alt={map.name}
                src={map.thumbnail_url_400}
                variant="rounded"
                sx={{ width: 80, height: 80 }}
              />
            ) : (
              <Skeleton variant="circular" width={80} height={80} />
            )}

            <Stack spacing={1}>
              {map ? (
                <>
                  <Typography
                    variant="subtitle1"
                    component="h1"
                    fontWeight={600}
                  >
                    {map.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    component="div"
                    color="text.secondary"
                  >
                    {reviews.length} {dictionary['spots count']}
                  </Typography>

                  {map.private && (
                    <Box>
                      <PrivateMapChip />
                    </Box>
                  )}
                </>
              ) : (
                <>
                  <Skeleton height={70} />
                  <Skeleton />
                </>
              )}
            </Stack>
          </Box>
        }
      >
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
        <CardContent sx={{ py: 0 }}>
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
      </BottomSheet>
    </>
  );
}

export default memo(MobileMapDrawer);
