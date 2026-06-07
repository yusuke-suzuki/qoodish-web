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
import {
  type FormEvent,
  memo,
  useCallback,
  useMemo,
  useState,
  useTransition
} from 'react';
import type { Profile } from '../../../types';
import { updateProfile } from '../../actions/users';
import useDictionary from '../../hooks/useDictionary';
import uploadImage from '../../utils/uploadImage';
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

  const [isPending, startTransition] = useTransition();

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!currentProfile) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
        return;
      }

      startTransition(async () => {
        try {
          let imageId: number | undefined;

          const url = thumbnailDataUrl ? new URL(thumbnailDataUrl) : null;

          if (url && url.protocol === 'data:') {
            imageId = await uploadImage(thumbnailDataUrl);
          }

          const result = await updateProfile(currentProfile.id, {
            name,
            biography,
            image_ids: imageId ? [imageId] : undefined
          });

          if (result.success) {
            enqueueSnackbar(dictionary['edit profile success'], {
              variant: 'success'
            });

            onClose();
            onSaved();
            return;
          }

          enqueueSnackbar(result.error ?? dictionary['an error occurred'], {
            variant: 'error'
          });
        } catch (_error) {
          enqueueSnackbar(dictionary['an error occurred'], {
            variant: 'error'
          });
        }
      });
    },
    [
      currentProfile,
      thumbnailDataUrl,
      name,
      biography,
      dictionary,
      onClose,
      onSaved
    ]
  );

  const handleExited = useCallback(() => {
    setName(undefined);
    setBiography(undefined);
    setThumbnailDataUrl(null);
  }, []);

  const setCurrentThumbnail = useCallback(() => {
    if (!currentProfile) {
      return;
    }

    setThumbnailDataUrl(currentProfile.image?.url ?? null);
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
      <form onSubmit={handleSubmit}>
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
              <AddPhotoButton onChange={handleImagesChange} color="inherit" />
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
          <Button
            type="button"
            onClick={onClose}
            disabled={isPending}
            color="inherit"
          >
            {dictionary.cancel}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={disabled}
            loading={isPending}
          >
            {dictionary.save}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});
