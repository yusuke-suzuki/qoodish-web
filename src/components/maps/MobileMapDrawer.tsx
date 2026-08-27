import {
  Box,
  CardActions,
  CardContent,
  Divider,
  Skeleton,
  SwipeableDrawer,
  Typography
} from '@mui/material';
import { memo, useContext, useEffect, useState } from 'react';
import type {
  AppMap,
  Chapter,
  Coauthor,
  Profile,
  Review
} from '../../../types/index.ts';
import ShellContext from '../../context/ShellContext.tsx';
import useDictionary from '../../hooks/useDictionary.ts';
import BookmarkButton from './BookmarkButton.tsx';
import Coauthors from './Coauthors.tsx';
import { drawerBleeding } from './constants.ts';
import MapCardHeader from './MapCardHeader.tsx';
import MapDetailTabs from './MapDetailTabs.tsx';
import MapMenuButton from './MapMenuButton.tsx';
import MobileMiniMapHeader from './MobileMiniMapHeader.tsx';
import PrivateMapChip from './PrivateMapChip.tsx';
import RemoveBookmarkButton from './RemoveBookmarkButton.tsx';

type Props = {
  map: AppMap | null;
  reviews: Review[];
  coauthors: Coauthor[];
  chapters: Chapter[];
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
  reviews,
  coauthors,
  chapters,
  currentProfile,
  onEditClick,
  onDeleteClick,
  onReportClick,
  onSaved,
  onReviewClick,
  reviewDrawerOpen
}: Props) {
  const [open, setOpen] = useState(false);

  const { setAppBarHidden } = useContext(ShellContext);
  const dictionary = useDictionary();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // The review drawer overrides this drawer's open prop, so while it is open
  // this drawer is visually closed even when `open` is still true. Keep the
  // AppBar visible in that case.
  useEffect(() => {
    setAppBarHidden(open && !reviewDrawerOpen);
  }, [open, reviewDrawerOpen, setAppBarHidden]);

  useEffect(() => {
    return () => setAppBarHidden(false);
  }, [setAppBarHidden]);

  const handleReviewClick = (review: Review) => {
    onReviewClick(review);
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      variant="temporary"
      hideBackdrop
      disableSwipeToOpen={false}
      open={reviewDrawerOpen ? false : open}
      onOpen={handleOpen}
      onClose={handleClose}
      swipeAreaWidth={drawerBleeding}
      sx={{
        zIndex: (theme) => theme.zIndex.appBar - 1,
        display: { xs: 'block', md: 'none' }
      }}
      SwipeAreaProps={{
        sx: {
          zIndex: (theme) => theme.zIndex.appBar - 2,
          display: { xs: 'block', md: 'none' }
        }
      }}
      slotProps={{
        root: {
          keepMounted: true
        },
        paper: {
          sx: {
            height: `calc(100% - ${drawerBleeding}px)`,
            overflow: 'visible',
            display: 'flex',
            flexDirection: 'column',
            // The bleeding header below forms the sheet's visual top edge
            // and carries the rounded corners instead.
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0
          }
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
          height: drawerBleeding,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16
        }}
      >
        <MobileMiniMapHeader map={map} reviews={reviews} draggable />
      </Box>
      <Divider />
      <Box sx={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
        {map?.private && (
          <Box sx={{ px: 2, pt: 2 }}>
            <PrivateMapChip />
          </Box>
        )}
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
            {map?.bookmarking ? (
              <RemoveBookmarkButton
                map={map}
                currentProfile={currentProfile}
                onSaved={onSaved}
              />
            ) : (
              <BookmarkButton map={map} onSaved={onSaved} />
            )}
          </CardActions>
        )}
        <Divider />
        <CardContent>
          <Typography variant="subtitle2" component="h2" gutterBottom>
            {dictionary.coauthors}
          </Typography>
          <Box sx={{ display: 'flex' }}>
            <Coauthors
              coauthors={coauthors}
              map={map}
              currentProfile={currentProfile}
            />
          </Box>
        </CardContent>
        <Divider />
        <MapDetailTabs
          reviews={reviews}
          chapters={chapters}
          onReviewClick={handleReviewClick}
        />
      </Box>
    </SwipeableDrawer>
  );
}

export default memo(MobileMapDrawer);
