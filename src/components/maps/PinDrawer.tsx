import { Comment, Flag, OutlinedFlag } from '@mui/icons-material';
import {
  Box,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  IconButton,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { memo, useCallback, useState } from 'react';
import type { Pin } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import BottomSheet from '../common/BottomSheet.tsx';
import IssueDialog from '../common/IssueDialog.tsx';
import ProfileBoundary from '../common/ProfileBoundary.tsx';
import DeletePinDialog from '../pins/DeletePinDialog.tsx';
import EditPinDialog from '../pins/EditPinDialog.tsx';
import LikePinButton from '../pins/LikePinButton.tsx';
import PinCardHeader from '../pins/PinCardHeader.tsx';
import PinMenuButton from '../pins/PinMenuButton.tsx';

type MilestoneAction = {
  selected: boolean;
  onAdd: () => void | Promise<void>;
};

type Props = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onExited: () => void;
  currentPin: Pin | null;
  milestoneAction?: MilestoneAction | null;
  onSaved: () => void;
  onDeleted: () => void;
};

function PinDrawer({
  open,
  onOpen,
  onClose,
  onExited,
  currentPin,
  milestoneAction,
  onSaved,
  onDeleted
}: Props) {
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [milestoneLoading, setMilestoneLoading] = useState(false);

  const handlePinDeleted = useCallback(() => {
    onClose();
    onDeleted();
  }, [onClose, onDeleted]);

  const handleAddMilestone = useCallback(async () => {
    if (!milestoneAction) {
      return;
    }

    setMilestoneLoading(true);

    try {
      await milestoneAction.onAdd();
    } finally {
      setMilestoneLoading(false);
    }
  }, [milestoneAction]);

  const pin = currentPin;

  return (
    <>
      <BottomSheet
        open={open}
        onOpen={onOpen}
        onClose={onClose}
        onExited={onExited}
        invisibleBackdrop
        sx={{
          zIndex: (theme) => theme.zIndex.appBar - 1,
          display: { xs: 'block', md: 'none' }
        }}
      >
        <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto' }}>
          <CardContent sx={{ pt: 0, pb: 1 }}>
            <Typography variant="h6">{pin?.name}</Typography>
          </CardContent>

          <PinCardHeader
            sx={{ pt: 0 }}
            pin={pin}
            hideMapLink
            action={
              <ProfileBoundary>
                {(profile) => (
                  <PinMenuButton
                    pin={pin}
                    currentProfile={profile}
                    onReportClick={() => setIssueDialogOpen(true)}
                    onEditClick={() => setEditDialogOpen(true)}
                    onDeleteClick={() => setDeleteDialogOpen(true)}
                  />
                )}
              </ProfileBoundary>
            }
          />

          <CardContent sx={{ pt: 0 }}>
            <Typography variant="body2" component="p">
              {pin?.comment}
            </Typography>
          </CardContent>

          <CardContent
            sx={{
              display: 'flex',
              gap: 2,
              width: '100%',
              overflowX: 'auto',
              py: 0
            }}
          >
            {pin?.images.map((image) => (
              <Box
                key={image.id}
                sx={{
                  flexShrink: 0,
                  width: 200,
                  height: 200,
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                <CardMedia
                  component="img"
                  alt={pin.name}
                  image={image.card}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            ))}
          </CardContent>
        </Box>

        <CardActions
          sx={{
            flexShrink: 0,
            justifyContent: 'space-between',
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          {pin && milestoneAction && (
            <Chip
              clickable
              color="default"
              disabled={milestoneAction.selected || milestoneLoading}
              onClick={handleAddMilestone}
              icon={
                milestoneLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : milestoneAction.selected ? (
                  <Flag />
                ) : (
                  <OutlinedFlag />
                )
              }
              label={
                milestoneAction.selected
                  ? dictionary['milestone added']
                  : dictionary['add milestone']
              }
            />
          )}

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {pin && <LikePinButton pin={pin} />}

            {pin && (
              <IconButton
                LinkComponent={Link}
                href={localePath(`/pins/${pin?.id}`)}
                disabled={!pin}
                title={dictionary.comment}
                aria-label={dictionary.comment}
              >
                <Comment />
              </IconButton>
            )}
          </Box>
        </CardActions>
      </BottomSheet>
      <EditPinDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        currentPin={pin}
        onSaved={onSaved}
      />
      <DeletePinDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        pin={pin}
        onDeleted={handlePinDeleted}
      />
      <IssueDialog
        open={issueDialogOpen}
        onClose={() => setIssueDialogOpen(false)}
        contentType="pin"
        contentId={pin ? pin.id : null}
      />
    </>
  );
}

export default memo(PinDrawer);
