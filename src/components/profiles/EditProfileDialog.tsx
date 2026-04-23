import {
  Box,
  Button,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Slide,
  type SlideProps,
  Typography
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { memo, useCallback, useMemo, useState } from 'react';
import type { Profile } from '../../../types';
import { updateProfile } from '../../actions/users';
import useDictionary from '../../hooks/useDictionary';
import uploadToStorage from '../../utils/uploadToStorage';
import AddPhotoButton from '../common/AddPhotoButton';
import BiographyForm from './BiographyForm';
import ProfileNameForm from './ProfileNameForm';

function Transition({
  ref,
  ...props
}: SlideProps & { ref?: React.Ref<unknown> }) {
  return <Slide direction="up" ref={ref} {...props} />;
}

type Props = {
  currentProfile: Profile | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export default memo(function EditProfileDialog({
  currentProfile,
  open,
  onClose,
  onSaved
}: Props) {
  const dictionary = useDictionary();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState<string | undefined>(undefined);
  const [biography, setBiography] = useState<string | undefined>(undefined);
  const [thumbnailDataUrl, setThumbnailDataUrl] = useState<string | null>(null);

  const disabled = useMemo(() => {
    return !name;
  }, [name]);

  const handleImagesChange = useCallback((currentDataUrls: string[]) => {
    if (currentDataUrls.length > 0) {
      setThumbnailDataUrl(currentDataUrls[0]);
    }
  }, []);

  const handleEditButtonClick = useCallback(async () => {
    setLoading(true);

    try {
      let imagePath: string | undefined;

      const url = thumbnailDataUrl ? new URL(thumbnailDataUrl) : null;

      if (url && url.protocol === 'data:') {
        const fileName = `profile/${self.crypto.randomUUID()}.jpg`;
        imagePath = await uploadToStorage(
          thumbnailDataUrl,
          fileName,
          'data_url'
        );
      }

      const result = await updateProfile(currentProfile?.id, {
        name,
        biography,
        image_path: imagePath
      });

      if (result.success) {
        enqueueSnackbar(dictionary['edit profile success'], {
          variant: 'success'
        });

        onClose();
        onSaved();
      } else {
        enqueueSnackbar(result.error, { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [
    currentProfile,
    name,
    biography,
    thumbnailDataUrl,
    onClose,
    onSaved,
    dictionary
  ]);

  const handleExited = useCallback(() => {
    setName(undefined);
    setBiography(undefined);
    setThumbnailDataUrl(null);
  }, []);

  const setCurrentThumbnail = useCallback(() => {
    if (!currentProfile) {
      return;
    }

    setThumbnailDataUrl(currentProfile.thumbnail_url);
  }, [currentProfile]);

  return (
    <Dialog
      open={open}
      onClose={(_event, reason) => {
        if (reason !== 'backdropClick') {
          onClose();
        }
      }}
      disableEscapeKeyDown
      fullWidth
      slots={{
        transition: Transition
      }}
      slotProps={{
        transition: { onEnter: setCurrentThumbnail, onExited: handleExited }
      }}
    >
      <DialogTitle>{dictionary['edit profile']}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {dictionary.thumbnail}
        </Typography>

        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="fit-content"
          position="relative"
          sx={{
            mb: 2
          }}
        >
          {thumbnailDataUrl ? (
            <CardMedia
              sx={{ width: 160, height: 160 }}
              image={thumbnailDataUrl}
            />
          ) : (
            <Skeleton
              sx={{ width: 160, height: 160 }}
              variant="rectangular"
              animation={false}
            />
          )}

          <Box position="absolute">
            <AddPhotoButton
              id="profile-thumbnail-input"
              onChange={handleImagesChange}
              color="inherit"
            />
          </Box>
        </Box>

        <ProfileNameForm
          onChange={setName}
          defaultValue={currentProfile?.name}
        />
        <BiographyForm
          onChange={setBiography}
          defaultValue={currentProfile?.biography}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading} color="inherit">
          {dictionary.cancel}
        </Button>
        <Button
          variant="contained"
          onClick={handleEditButtonClick}
          color="secondary"
          disabled={disabled}
          loading={loading}
        >
          {dictionary.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
});
