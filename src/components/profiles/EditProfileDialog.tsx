import { LoadingButton } from '@mui/lab';
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
  forwardRef,
  memo,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';
import type { Profile } from '../../../types';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import uploadToStorage from '../../utils/uploadToStorage';
import AddPhotoButton from '../common/AddPhotoButton';
import BiographyForm from './BiographyForm';
import ProfileNameForm from './ProfileNameForm';

const Transition = forwardRef(function Transition(props: SlideProps, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type Props = {
  currentProfile: Profile | null;
  open: boolean;
  onClose: () => void;
  onSaved: (profile: Profile) => void;
};

export default memo(function EditProfileDialog({
  currentProfile,
  open,
  onClose,
  onSaved
}: Props) {
  const { currentUser } = useContext(AuthContext);
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

    const params = {
      name: name,
      biography: biography
    };

    const url = thumbnailDataUrl ? new URL(thumbnailDataUrl) : null;

    if (url && url.protocol === 'data:') {
      const fileName = `profile/${self.crypto.randomUUID()}.jpg`;
      const url = await uploadToStorage(thumbnailDataUrl, fileName, 'data_url');

      Object.assign(params, {
        image_path: url
      });
    }

    const token = await currentUser.getIdToken();

    const headers = new Headers({
      Accept: 'application/json',
      'Accept-Language': window.navigator.language,
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: `Bearer ${token}`
    });

    const request = new Request(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/users/${currentProfile?.id}`,
      {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(params)
      }
    );

    try {
      const res = await fetch(request);

      if (res.ok) {
        enqueueSnackbar(dictionary['edit profile success'], {
          variant: 'success'
        });
        const body = await res.json();

        onClose();
        onSaved(body);
      } else {
        const body = await res.json();
        enqueueSnackbar(body.detail, { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(dictionary['an error occured'], { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [
    currentProfile,
    name,
    biography,
    thumbnailDataUrl,
    currentUser,
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
      TransitionComponent={Transition}
      TransitionProps={{ onEnter: setCurrentThumbnail, onExited: handleExited }}
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
        <LoadingButton
          variant="contained"
          onClick={handleEditButtonClick}
          color="secondary"
          disabled={disabled}
          loading={loading}
        >
          {dictionary.save}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});
