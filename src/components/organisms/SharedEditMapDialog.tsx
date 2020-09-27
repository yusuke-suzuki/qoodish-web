import React, { useState, useCallback, useEffect } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useDispatch } from 'redux-react-hook';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';
import Fade from '@material-ui/core/Fade';
import Chip from '@material-ui/core/Chip';
import PlaceIcon from '@material-ui/icons/Place';
import Avatar from '@material-ui/core/Avatar';
import LockIcon from '@material-ui/icons/Lock';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import GroupIcon from '@material-ui/icons/Group';
import ListSubheader from '@material-ui/core/ListSubheader';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import IconButton from '@material-ui/core/IconButton';
import CardMedia from '@material-ui/core/CardMedia';
import Skeleton from '@material-ui/lab/Skeleton';

import I18n from '../../utils/I18n';
import openBaseSelectDialog from '../../actions/openBaseSelectDialog';
import DialogAppBar from '../molecules/DialogAppBar';
import { useTheme } from '@material-ui/core';

const styles = {
  dialogContentLarge: {},
  dialogContentSmall: {
    paddingTop: 24
  },
  mapCenterChip: {
    marginTop: 16,
    marginBottom: 16
  },
  selectionLabel: {
    display: 'flex',
    alignItems: 'center'
  },
  selectionIcon: {
    color: '#616161',
    marginRight: 10
  },
  controlLabel: {
    width: '100%'
  },
  placeChipLabel: {
    overflow: 'hidden',
    maxWidth: 'calc(100vw - 100px)',
    textOverflow: 'ellipsis'
  },
  thumbnailContainer: {
    marginBottom: 20,
    position: 'relative'
  },
  thumbnail: {
    width: 80,
    height: 80
  },
  imageInput: {
    display: 'none'
  },
  editImageButton: {
    position: 'absolute',
    top: 16,
    left: 16
  }
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const SharedEditMapDialog = props => {
  const {
    currentMap,
    handleSaveButtonClick,
    selectedBase,
    dialogOpen,
    handleRequestDialogClose
  } = props;

  const [mapId, setMapId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privateMap, setPrivateMap] = useState(false);
  const [invitable, setInvitable] = useState(false);
  const [shared, setShared] = useState(false);
  const [errorMapName, setErrorMapName] = useState(undefined);
  const [errorDescription, setErrorDescription] = useState(undefined);
  const [disabled, setDisabled] = useState(undefined);
  const [editImage, setEditImage] = useState(false);

  useEffect(() => {
    if (name && description && !errorMapName && !errorDescription) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [name, description]);

  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const dispatch = useDispatch();

  const setCurrentMap = useCallback(() => {
    if (currentMap) {
      setMapId(currentMap.id);
      setImageUrl(currentMap.thumbnail_url);
      setName(currentMap.name);
      setDescription(currentMap.description);
      setPrivateMap(currentMap.private);
      setInvitable(currentMap.invitable);
      setShared(currentMap.shared);
      setDisabled(true);
    }
  }, [currentMap]);

  const clearState = useCallback(() => {
    setMapId('');
    setImageUrl('');
    setName('');
    setDescription('');
    setPrivateMap(false);
    setInvitable(false);
    setShared(false);
    setErrorMapName(undefined);
    setErrorDescription(undefined);
    setDisabled(true);
    setEditImage(false);
  }, []);

  const handleMapNameChange = useCallback(input => {
    if (input) {
      if (input.length > 30) {
        setErrorMapName(I18n.t('max characters 30'));
      } else {
        setErrorMapName(undefined);
      }
    } else {
      setErrorMapName(I18n.t('map name is required'));
    }
    setName(input);
  }, []);

  const handleMapDescriptionChange = useCallback(input => {
    if (input) {
      if (input.length > 200) {
        setErrorDescription(I18n.t('max characters 200'));
      } else {
        setErrorDescription(undefined);
      }
    } else {
      setErrorDescription(I18n.t('description is required'));
    }
    setDescription(input);
  }, []);

  const handlePrivateFlugChange = useCallback((e, checked) => {
    setPrivateMap(checked);
  }, []);

  const handleInvitableFlugChange = useCallback((e, checked) => {
    setInvitable(checked);
  }, []);

  const handleSharedFlugChange = useCallback((e, checked) => {
    setShared(checked);
  }, []);

  const handleSaveClick = useCallback(() => {
    let params = {
      name: name,
      description: description,
      base_id: selectedBase ? selectedBase.placeId : '',
      base_name: selectedBase ? selectedBase.description : '',
      private: privateMap,
      invitable: invitable,
      shared: shared
    };

    if (editImage) {
      Object.assign(params, {
        image_url: imageUrl
      });
    }

    handleSaveButtonClick(params, mapId);
  }, [
    name,
    description,
    selectedBase,
    privateMap,
    invitable,
    shared,
    editImage,
    imageUrl,
    mapId,
    handleSaveButtonClick
  ]);

  const handleMapBaseClick = useCallback(() => {
    dispatch(openBaseSelectDialog());
  }, [dispatch]);

  const handleAddImageClick = useCallback(() => {
    document.getElementById('image-input').click();
  }, []);

  const handleImageChange = useCallback(e => {
    let reader = new FileReader();
    let file = e.target.files[0];
    if (!file.type.match(/image\/*/)) {
      return;
    }

    reader.onloadend = () => {
      let dataUrl = reader.result;
      setEditImage(true);
      setImageUrl(dataUrl);
    };

    reader.readAsDataURL(file);
  }, []);

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleRequestDialogClose}
      onEnter={setCurrentMap}
      onExited={clearState}
      disableBackdropClick
      disableEscapeKeyDown
      fullWidth
      fullScreen={!smUp}
      TransitionComponent={smUp ? Fade : Transition}
    >
      {smUp ? (
        <DialogTitle>
          {currentMap ? I18n.t('edit map') : I18n.t('create new map')}
        </DialogTitle>
      ) : (
        <DialogAppBar
          title={currentMap ? I18n.t('edit map') : I18n.t('create new map')}
          action={
            <Button
              variant="contained"
              onClick={handleSaveClick}
              color="secondary"
              disabled={disabled}
            >
              {I18n.t('save')}
            </Button>
          }
          handleRequestDialogClose={handleRequestDialogClose}
        />
      )}
      <DialogContent
        style={smUp ? styles.dialogContentLarge : styles.dialogContentSmall}
      >
        <div style={styles.thumbnailContainer}>
          {imageUrl ? (
            <CardMedia style={styles.thumbnail} image={imageUrl} />
          ) : (
            <Skeleton
              style={styles.thumbnail}
              variant="rect"
              animation={false}
            />
          )}
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
          id="image-input"
          onChange={handleImageChange}
          style={styles.imageInput}
        />
        <TextField
          label={I18n.t('map name')}
          onChange={e => handleMapNameChange(e.target.value)}
          error={errorMapName ? true : false}
          helperText={errorMapName}
          fullWidth
          autoFocus
          required
          value={name}
        />
        <TextField
          label={I18n.t('description')}
          onChange={e => handleMapDescriptionChange(e.target.value)}
          error={errorDescription ? true : false}
          helperText={errorDescription}
          fullWidth
          required
          value={description}
          margin="normal"
          multiline
          rows="7"
        />
        <Chip
          avatar={
            <Avatar>
              <PlaceIcon />
            </Avatar>
          }
          label={
            <div style={styles.placeChipLabel}>
              {selectedBase
                ? selectedBase.description
                : I18n.t('center of map')}
            </div>
          }
          onClick={handleMapBaseClick}
          style={styles.mapCenterChip}
          clickable
        />
        <br />
        <ListSubheader disableGutters>{I18n.t('options')}</ListSubheader>
        <div>
          <FormControlLabel
            control={
              <Switch checked={shared} onChange={handleSharedFlugChange} />
            }
            label={
              <Typography
                variant="subtitle2"
                color="inherit"
                style={styles.selectionLabel}
              >
                <GroupIcon style={styles.selectionIcon} />
                {I18n.t('allow followers to post')}
              </Typography>
            }
            style={styles.controlLabel}
          />
        </div>
        <div>
          <FormControlLabel
            control={
              <Switch checked={privateMap} onChange={handlePrivateFlugChange} />
            }
            label={
              <Typography
                variant="subtitle2"
                color="inherit"
                style={styles.selectionLabel}
              >
                <LockIcon style={styles.selectionIcon} />
                {I18n.t('set this map to private')}
              </Typography>
            }
            style={styles.controlLabel}
          />
        </div>
        <div>
          <FormControlLabel
            control={
              <Switch
                checked={invitable}
                onChange={handleInvitableFlugChange}
              />
            }
            label={
              <Typography
                variant="subtitle2"
                color="inherit"
                style={styles.selectionLabel}
              >
                <PersonAddIcon style={styles.selectionIcon} />
                {I18n.t('allow followers to invite')}
              </Typography>
            }
            style={styles.controlLabel}
          />
        </div>
      </DialogContent>
      {smUp && (
        <DialogActions>
          <Button onClick={handleRequestDialogClose}>{I18n.t('cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleSaveClick}
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

export default React.memo(SharedEditMapDialog);
