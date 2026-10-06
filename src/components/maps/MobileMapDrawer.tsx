import {
  Box,
  CardActions,
  CardContent,
  Divider,
  Skeleton,
  SwipeableDrawer,
  type Theme,
  Typography
} from '@mui/material';
import { memo } from 'react';
import type {
  AppMap,
  Chapter,
  Coauthor,
  Pin,
  Profile
} from '../../../types/index.ts';
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
  pins: Pin[];
  coauthors: Coauthor[];
  chapters: Chapter[];
  currentProfile: Profile | null;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onReportClick: () => void;
  onPinPropertiesClick: () => void;
  onSaved: () => void;
  onPinClick: (pin: Pin) => void;
  pinDrawerOpen: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function MobileMapDrawer({
  map,
  pins,
  coauthors,
  chapters,
  currentProfile,
  onEditClick,
  onDeleteClick,
  onReportClick,
  onPinPropertiesClick,
  onSaved,
  onPinClick,
  pinDrawerOpen,
  open,
  onOpenChange
}: Props) {
  const dictionary = useDictionary();

  const handlePinClick = (pin: Pin) => {
    onPinClick(pin);
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      variant="temporary"
      hideBackdrop
      disableSwipeToOpen={false}
      open={pinDrawerOpen ? false : open}
      onOpen={() => onOpenChange(true)}
      onClose={() => onOpenChange(false)}
      swipeAreaWidth={drawerBleeding}
      sx={{
        zIndex: (theme) => theme.zIndex.appBar - 1,
        display: { xs: 'block', md: 'none' }
      }}
      SwipeAreaProps={{
        sx: {
          zIndex: (theme: Theme) => theme.zIndex.appBar - 2,
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
        <MobileMiniMapHeader map={map} pins={pins} draggable />
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
              onPinPropertiesClick={onPinPropertiesClick}
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
          pins={pins}
          chapters={chapters}
          onPinClick={handlePinClick}
        />
      </Box>
    </SwipeableDrawer>
  );
}

export default memo(MobileMapDrawer);
