import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';
import Fade from '@material-ui/core/Fade';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import IconButton from '@material-ui/core/IconButton';
import I18n from '../../utils/I18n';

import fetchMyProfile from '../../actions/fetchMyProfile';
import closeEditProfileDialog from '../../actions/closeEditProfileDialog';
import openToast from '../../actions/openToast';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';
import uploadToStorage from '../../utils/uploadToStorage';
import sleep from '../../utils/sleep';

import { UsersApi, NewUser } from 'qoodish_api';
import DialogAppBar from '../molecules/DialogAppBar';

const styles = {
  dialogContentSmall: {
    paddingTop: 24
  },
  avatarContainer: {
    marginBottom: 20,
    position: 'relative'
  },
  profileAvatar: {
    width: 80,
    height: 80
  },
  imageInput: {
    display: 'none'
  },
  image: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  editImageButton: {
    position: 'absolute',
    top: 16,
    left: 16
  }
};

const Transition = props => {
  return <Slide direction="up" {...props} />;
};

const EditProfileDialog = () => {
  const large = useMediaQuery('(min-width: 600px)');
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      dialogOpen: state.profile.editProfileDialogOpen,
      currentUser: state.app.currentUser
    }),
    []
  );
  const { dialogOpen, currentUser } = useMappedState(mapState);

  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [bio, setBio] = useState('');
  const [editImage, setEditImage] = useState(false);
  const [errorName, setErrorName] = useState(undefined);
  const [errorBio, setErrorBio] = useState(undefined);
  const [disabled, setDisabled] = useState(true);

  useEffect(
    () => {
      if (name && !errorName && !errorBio) {
        setDisabled(false);
      } else {
        setDisabled(true);
      }
    },
    [name, bio]
  );

  const handleRequestDialogClose = useCallback(() => {
    dispatch(closeEditProfileDialog());
  });

  const setCurrentProfile = useCallback(
    () => {
      setName(currentUser.name);
      setBio(currentUser.biography);
      setImageUrl(currentUser.thumbnail_url);
    },
    [currentUser]
  );

  const clearState = useCallback(() => {
    setName('');
    setImageUrl('');
    setBio('');
    setErrorName(undefined);
    setErrorBio(undefined);
    setDisabled(true);
  });

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
  });

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
  });

  const handleAddImageClick = useCallback(() => {
    document.getElementById('profile-image-input').click();
  });

  const handleImageChange = useCallback(e => {
    let reader = new FileReader();
    let file = e.target.files[0];
    if (!file.type.match(/image\/*/)) {
      return;
    }

    reader.onloadend = () => {
      let dataUrl = reader.result;
      setImageUrl(dataUrl);
      setEditImage(true);
    };

    reader.readAsDataURL(file);
  });

  const handleSaveButtonClick = useCallback(async () => {
    let params = {
      display_name: name,
      biography: bio
    };
    if (editImage) {
      params.image_url = imageUrl;
    }

    dispatch(requestStart());

    if (params.image_url) {
      const uploadResponse = await uploadToStorage(
        params.image_url,
        'profile',
        'data_url'
      );
      params.image_url = uploadResponse.imageUrl;
    }

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
          await sleep(5000);
          dispatch(fetchMyProfile(response.body));
        } else if (response.status == 409) {
          dispatch(openToast(response.body.detail));
        } else {
          dispatch(openToast('Failed to update profile.'));
        }
      }
    );
  });

  return (
    <Dialog
      open={dialogOpen}
      onEnter={setCurrentProfile}
      onClose={handleRequestDialogClose}
      onExit={clearState}
      disableBackdropClick
      disableEscapeKeyDown
      fullWidth
      fullScreen={!large}
      TransitionComponent={large ? Fade : Transition}
    >
      {large ? (
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
      <DialogContent style={large ? {} : styles.dialogContentSmall}>
        <div style={styles.avatarContainer}>
          <Avatar src={imageUrl} style={styles.profileAvatar}>
            <img src={imageUrl} style={styles.image} />
          </Avatar>
          <IconButton
            onClick={handleAddImageClick}
            style={styles.editImageButton}
          >
            <PhotoCameraIcon />
          </IconButton>
        </div>
        <input
          type="file"
          accept="image/*"
          id="profile-image-input"
          onChange={handleImageChange}
          style={styles.imageInput}
        />
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
          rowsMax={large ? '3' : '2'}
          rows={large ? '3' : '3'}
          value={bio ? bio : ''}
          margin="normal"
        />
      </DialogContent>
      {large && (
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
