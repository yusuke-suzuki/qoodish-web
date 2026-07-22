import {
  Box,
  Button,
  CardMedia,
  CircularProgress,
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
import type { Journal, Profile } from '../../../types';
import { updateJournal } from '../../actions/journals';
import { updateProfile } from '../../actions/users';
import useDictionary from '../../hooks/useDictionary';
import usePhotoUploads from '../../hooks/usePhotoUploads';
import AddPhotoButton from '../common/AddPhotoButton';
import BiographyForm from './BiographyForm';
import JournalTitleForm from './JournalTitleForm';
import ProfileNameForm from './ProfileNameForm';

function Transition({
  ref,
  ...props
}: SlideProps & { ref?: React.Ref<unknown> }) {
  return <Slide direction="up" ref={ref} {...props} />;
}

type Props = {
  currentProfile: Profile | null;
  journal: Journal | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export default memo(function EditProfileDialog({
  currentProfile,
  journal,
  open,
  onClose,
  onSaved
}: Props) {
  const dictionary = useDictionary();

  const [name, setName] = useState<string | undefined>(undefined);
  const [biography, setBiography] = useState<string | undefined>(undefined);
  const [journalTitle, setJournalTitle] = useState<string | undefined>(
    undefined
  );
  const { items, isUploading, uploadedImages, upload, reset } =
    usePhotoUploads();

  const disabled = useMemo(() => {
    return !name || (Boolean(journal) && !journalTitle) || isUploading;
  }, [name, journal, journalTitle, isUploading]);

  const previewItem = items[0];
  const newThumbnailUrl =
    previewItem?.status === 'uploading'
      ? previewItem.previewUrl
      : (previewItem?.image.card ?? null);
  const thumbnailUrl = newThumbnailUrl ?? currentProfile?.image?.card ?? null;

  const handleImagesChange = useCallback(
    async (dataUrls: string[]) => {
      if (dataUrls.length < 1) {
        return;
      }
      reset();
      try {
        await upload([dataUrls[0]]);
      } catch (_error) {
        enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      }
    },
    [reset, upload, dictionary]
  );

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
          const result = await updateProfile(currentProfile.id, {
            name,
            biography,
            image_ids:
              uploadedImages.length > 0
                ? uploadedImages.map((image) => image.id)
                : undefined
          });

          if (!result.success) {
            enqueueSnackbar(result.error ?? dictionary['an error occurred'], {
              variant: 'error'
            });
            return;
          }

          // The profile is already persisted at this point, so a failing
          // journal update reports itself but must not withhold the refresh.
          if (journal) {
            const journalResult = await updateJournal(journal.id, {
              title: journalTitle
            });

            if (!journalResult.success) {
              enqueueSnackbar(
                journalResult.error ?? dictionary['an error occurred'],
                { variant: 'error' }
              );
              onSaved();
              return;
            }
          }

          enqueueSnackbar(dictionary['edit profile success'], {
            variant: 'success'
          });

          onClose();
          onSaved();
        } catch (_error) {
          enqueueSnackbar(dictionary['an error occurred'], {
            variant: 'error'
          });
        }
      });
    },
    [
      currentProfile,
      journal,
      journalTitle,
      uploadedImages,
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
    setJournalTitle(undefined);
    reset();
  }, [reset]);

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
        transition: { onExited: handleExited }
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
            {thumbnailUrl ? (
              <CardMedia
                sx={{
                  width: 160,
                  height: 160,
                  opacity: isUploading ? 0.4 : 1
                }}
                image={thumbnailUrl}
              />
            ) : (
              <Skeleton
                sx={{ width: 160, height: 160 }}
                variant="rectangular"
                animation={false}
              />
            )}

            <Box position="absolute">
              {isUploading ? (
                <CircularProgress />
              ) : (
                <AddPhotoButton
                  onChange={handleImagesChange}
                  color="inherit"
                  disabled={isPending}
                />
              )}
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
          {journal && (
            <JournalTitleForm
              onChange={setJournalTitle}
              defaultValue={journal.title}
            />
          )}
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
