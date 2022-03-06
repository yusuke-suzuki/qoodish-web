import React, {
  useState,
  useCallback,
  useEffect,
  useContext,
  forwardRef
} from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Slide, { SlideProps } from '@material-ui/core/Slide';
import Fade from '@material-ui/core/Fade';
import I18n from '../../utils/I18n';

import fetchMyProfile from '../../actions/fetchMyProfile';
import closeEditProfileDialog from '../../actions/closeEditProfileDialog';
import openToast from '../../actions/openToast';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';
import uploadToStorage from '../../utils/uploadToStorage';
import sleep from '../../utils/sleep';

import { UsersApi, NewUser } from '@yusuke-suzuki/qoodish-api-js-client';
import DialogAppBar from '../molecules/DialogAppBar';
import AuthContext from '../../context/AuthContext';
import { v1 as uuidv1 } from 'uuid';
import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  useTheme
} from '@material-ui/core';
import AddPhotoButton from '../molecules/AddPhotoButton';
import Skeleton from '@material-ui/lab/Skeleton';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogContentSmall: {
      paddingTop: theme.spacing(3)
    },
    avatarContainer: {
      marginBottom: 20,
      position: 'relative'
    },
    profileAvatar: {
      width: 80,
      height: 80
    },
    image: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    editImageButton: {
      position: 'absolute',
      top: theme.spacing(2),
      left: theme.spacing(2)
    }
  })
);

const Transition = forwardRef(function Transition(props: SlideProps, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const EditProfileDialog = () => {
  const classes = useStyles();
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      dialogOpen: state.profile.editProfileDialogOpen,
      profile: state.app.profile
    }),
    []
  );
  const { dialogOpen, profile } = useMappedState(mapState);
  const { currentUser } = useContext(AuthContext);

  const [name, setName] = useState<string>('');
  const [dataUrl, setDataUrl] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [errorName, setErrorName] = useState<string>(undefined);
  const [errorBio, setErrorBio] = useState<string>(undefined);
  const [disabled, setDisabled] = useState<boolean>(true);

  useEffect(() => {
    if (name && !errorName && !errorBio) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [name, bio]);

  const handleRequestDialogClose = useCallback(() => {
    dispatch(closeEditProfileDialog());
  }, [dispatch]);

  const setCurrentProfile = useCallback(() => {
    setName(profile.name);
    setBio(profile.biography);
    setDataUrl(profile.thumbnail_url);
  }, [profile]);

  const clearState = useCallback(() => {
    setName('');
    setDataUrl('');
    setBio('');
    setErrorName(undefined);
    setErrorBio(undefined);
    setDisabled(true);
  }, []);

  const handleImagesChange = useCallback(currentDataUrls => {
    if (currentDataUrls.length > 0) {
      setDataUrl(currentDataUrls[0]);
    }
  }, []);

  const handleNameChange = useCallback(inputName => {
    if (inputName) {
      if (inputName.length > 30) {
        setErrorName(I18n.t('max characters 30'));
      } else {
        setErrorName(undefined);
      }
    } else {
      setErrorName(I18n.t('name is required'));
    }
    setName(inputName);
  }, []);

  const handleBioChange = useCallback(inputBio => {
    if (inputBio) {
      if (inputBio.length > 160) {
        setErrorBio(I18n.t('max characters 160'));
      } else {
        setErrorBio(undefined);
      }
    } else {
      setErrorBio(undefined);
    }
    setBio(inputBio);
  }, []);

  const handleSaveButtonClick = useCallback(async () => {
    const params = {
      display_name: name,
      biography: bio
    };

    const url = new URL(dataUrl);

    if (url.protocol === 'data:') {
      const fileName = `profile/${uuidv1()}.jpg`;
      const url = await uploadToStorage(dataUrl, fileName, 'data_url');

      Object.assign(params, {
        image_url: url
      });
    }

    dispatch(requestStart());

    const apiInstance = new UsersApi();
    const newUser = NewUser.constructFromObject(params);
    apiInstance.usersUserIdPut(
      currentUser.uid,
      newUser,
      async (error, data, response) => {
        dispatch(requestFinish());

        if (response.ok) {
          dispatch(closeEditProfileDialog());
          dispatch(openToast(I18n.t('edit profile success')));
          // wait until thumbnail created on cloud function
          await sleep(3000);
          dispatch(fetchMyProfile(response.body));
        } else if (response.status == 409) {
          dispatch(openToast(response.body.detail));
        } else {
          dispatch(openToast('Failed to update profile.'));
        }
      }
    );
  }, [dispatch, currentUser, name, bio, dataUrl]);

  return (
    <Dialog
      open={dialogOpen}
      onEnter={setCurrentProfile}
      onClose={handleRequestDialogClose}
      onExited={clearState}
      disableBackdropClick
      disableEscapeKeyDown
      fullWidth
      fullScreen={!smUp}
      TransitionComponent={smUp ? Fade : Transition}
    >
      {smUp ? (
        <DialogTitle>{I18n.t('edit profile')}</DialogTitle>
      ) : (
        <DialogAppBar
          title={I18n.t('edit profile')}
          handleRequestDialogClose={handleRequestDialogClose}
          color="inherit"
          action={
            <Button
              variant="contained"
              onClick={handleSaveButtonClick}
              color="primary"
              disabled={disabled}
            >
              {I18n.t('save')}
            </Button>
          }
        />
      )}
      <DialogContent className={smUp ? null : classes.dialogContentSmall}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="fit-content"
          className={classes.avatarContainer}
        >
          {dataUrl ? (
            <Avatar src={dataUrl} className={classes.profileAvatar}>
              <img src={dataUrl} className={classes.image} />
            </Avatar>
          ) : (
            <Skeleton variant="circle" width={80} height={80} />
          )}

          <Box position="absolute">
            <AddPhotoButton
              id="profile-image-input"
              onChange={handleImagesChange}
              color="inherit"
            />
          </Box>
        </Box>

        <TextField
          label={I18n.t('name')}
          onChange={e => handleNameChange(e.target.value)}
          error={errorName ? true : false}
          helperText={errorName}
          fullWidth
          autoFocus
          required
          value={name}
          margin="normal"
        />
        <TextField
          label={I18n.t('biography')}
          onChange={e => handleBioChange(e.target.value)}
          error={errorBio ? true : false}
          helperText={errorBio}
          fullWidth
          multiline
          rowsMax={smUp ? '3' : '2'}
          rows={smUp ? '3' : '3'}
          value={bio ? bio : ''}
          margin="normal"
        />
      </DialogContent>
      {smUp && (
        <DialogActions>
          <Button onClick={handleRequestDialogClose}>{I18n.t('cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleSaveButtonClick}
            color="primary"
            disabled={disabled}
          >
            {I18n.t('save')}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default React.memo(EditProfileDialog);
