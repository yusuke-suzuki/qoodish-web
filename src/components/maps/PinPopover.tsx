import { Comment } from '@mui/icons-material';
import {
  CardActions,
  CardContent,
  IconButton,
  Popover,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { memo, useState } from 'react';
import type { AppMap, Pin, PinProperty } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import ProfileBoundary from '../common/ProfileBoundary.tsx';
import ReportDialog from '../common/ReportDialog.tsx';
import DeletePinDialog from '../pins/DeletePinDialog.tsx';
import EditPinDialog from '../pins/EditPinDialog.tsx';
import LikePinButton from '../pins/LikePinButton.tsx';
import PinCardHeader from '../pins/PinCardHeader.tsx';
import PinImageCarousel from '../pins/PinImageCarousel.tsx';
import PinMenuButton from '../pins/PinMenuButton.tsx';

type Props = {
  currentPin: Pin | null;
  map: AppMap | null;
  pinProperties: PinProperty[];
  anchorEl: HTMLButtonElement | null;
  popoverId: string | undefined;
  popoverOpen: boolean;
  onPopoverClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
};

function PinPopover({
  currentPin,
  map,
  pinProperties,
  anchorEl,
  popoverId,
  popoverOpen,
  onPopoverClose,
  onSaved,
  onDeleted
}: Props) {
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const pin = currentPin;

  return (
    <>
      <Popover
        id={popoverId}
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={onPopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        slotProps={{
          paper: {
            sx: {
              width: 320
            }
          }
        }}
        disableScrollLock
      >
        <PinCardHeader
          pin={pin}
          hideMapLink
          action={
            <ProfileBoundary>
              {(profile) => (
                <PinMenuButton
                  pin={pin}
                  currentProfile={profile}
                  onReportClick={() => setReportDialogOpen(true)}
                  onEditClick={() => setEditDialogOpen(true)}
                  onDeleteClick={() => setDeleteDialogOpen(true)}
                />
              )}
            </ProfileBoundary>
          }
        />
        {pin && <PinImageCarousel key={pin.id} pin={pin} />}
        <CardContent sx={{ pt: (pin?.images.length ?? 0) > 0 ? 2 : 0, pb: 0 }}>
          <Typography variant="h6" gutterBottom>
            {pin?.name}
          </Typography>
          <Typography variant="body2" component="p">
            {pin?.comment}
          </Typography>
        </CardContent>
        <CardActions>
          {pin && <LikePinButton pin={pin} onSaved={onSaved} />}

          <IconButton
            LinkComponent={Link}
            href={localePath(`/pins/${pin?.id}`)}
            disabled={!pin}
            title={dictionary.comment}
            aria-label={dictionary.comment}
          >
            <Comment />
          </IconButton>
        </CardActions>
      </Popover>

      <EditPinDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        currentPin={pin}
        map={map}
        pinProperties={pinProperties}
        onSaved={onSaved}
      />

      <DeletePinDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        pin={pin}
        onDeleted={onDeleted}
      />

      <ReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        moderatableType="Pin"
        moderatableId={pin ? pin.id : null}
      />
    </>
  );
}

export default memo(PinPopover);
