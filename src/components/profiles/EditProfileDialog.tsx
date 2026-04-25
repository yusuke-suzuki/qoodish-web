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
  memo,
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
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

type FormState = { error: string | null };
const initialState: FormState = { error: null };

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

  const [state, submitAction, isPending] = useActionState<FormState, FormData>(
    async (_prevState, _formData) => {
      if (!currentProfile) {
        return { error: dictionary['an error occurred'] };
      }

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

        const result = await updateProfile(currentProfile.id, {
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
          return { error: null };
        }

        return { error: result.error ?? dictionary['an error occurred'] };
      } catch (_error) {
        return { error: dictionary['an error occurred'] };
      }
    },
    initialState
  );

  useEffect(() => {
    if (state.error) {
      enqueueSnackbar(state.error, { variant: 'error' });
    }
  }, [state]);

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
      <form action={submitAction}>
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
