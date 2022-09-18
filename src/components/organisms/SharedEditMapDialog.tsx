import React, { useState, useCallback, useEffect, forwardRef } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Slide, { SlideProps } from '@material-ui/core/Slide';
import Fade from '@material-ui/core/Fade';
import LockIcon from '@material-ui/icons/Lock';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import GroupIcon from '@material-ui/icons/Group';
import ListSubheader from '@material-ui/core/ListSubheader';
import CardMedia from '@material-ui/core/CardMedia';
import Skeleton from '@material-ui/lab/Skeleton';

import DialogAppBar from '../molecules/DialogAppBar';
import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  useTheme
} from '@material-ui/core';
import AddPhotoButton from '../molecules/AddPhotoButton';
import { v1 as uuidv1 } from 'uuid';
import uploadToStorage from '../../utils/uploadToStorage';
import PlaceAutocomplete from '../molecules/PlaceAutocomplete';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogContent: {
      paddingTop: theme.spacing(3),
      [theme.breakpoints.up('sm')]: {
        paddingTop: 'initial'
      }
    },
    mapCenterChip: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2)
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
    }
  })
);

const Transition = forwardRef(function Transition(props: SlideProps, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type Props = {
  currentMap?: any;
  handleSaveButtonClick: any;
  dialogOpen: boolean;
  handleRequestDialogClose: any;
};

const SharedEditMapDialog = (props: Props) => {
  const {
    currentMap,
    handleSaveButtonClick,
    dialogOpen,
    handleRequestDialogClose
  } = props;

  const classes = useStyles();

  const [mapId, setMapId] = useState<string>('');
  const [dataUrl, setDataUrl] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [privateMap, setPrivateMap] = useState<boolean>(false);
  const [invitable, setInvitable] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);
  const [selectedBase, setSelectedBase] = useState<{
    placeId: string;
    description: string;
  } | null>(null);
  const [errorMapName, setErrorMapName] = useState<string>(undefined);
  const [errorDescription, setErrorDescription] = useState<string>(undefined);
  const [disabled, setDisabled] = useState<boolean>(true);

  useEffect(() => {
    if (name && description && !errorMapName && !errorDescription) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [name, description]);

  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const { I18n } = useLocale();

  const setCurrentMap = useCallback(() => {
    if (currentMap) {
      setMapId(currentMap.id);
      setDataUrl(currentMap.thumbnail_url);
      setName(currentMap.name);
      setDescription(currentMap.description);
      setPrivateMap(currentMap.private);
      setInvitable(currentMap.invitable);
      setShared(currentMap.shared);
      setSelectedBase(currentMap.base);
      setDisabled(true);
    }
  }, [currentMap]);

  const clearState = useCallback(() => {
    setMapId('');
    setDataUrl('');
    setName('');
    setDescription('');
    setPrivateMap(false);
    setInvitable(false);
    setShared(false);
    setErrorMapName(undefined);
    setErrorDescription(undefined);
    setSelectedBase(null);
    setDisabled(true);
  }, []);

  const handlePlaceChange = useCallback(place => {
    if (place) {
      setSelectedBase({
        placeId: place.place_id,
        description: place.description
      });
    } else {
      setSelectedBase(null);
    }
  }, []);

  const handleImagesChange = useCallback(currentDataUrls => {
    if (currentDataUrls.length > 0) {
      setDataUrl(currentDataUrls[0]);
    }
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

  const handleSaveClick = useCallback(async () => {
    const params = {
      name: name,
      description: description,
      base_id: selectedBase ? selectedBase.placeId : '',
      base_name: selectedBase ? selectedBase.description : '',
      private: privateMap,
      invitable: invitable,
      shared: shared
    };

    const url = dataUrl ? new URL(dataUrl) : null;

    if (url && url.protocol === 'data:') {
      const fileName = `maps/${uuidv1()}.jpg`;
      const url = await uploadToStorage(dataUrl, fileName, 'data_url');

      Object.assign(params, {
        image_url: url
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
    dataUrl,
    mapId,
    handleSaveButtonClick
  ]);

  useEffect(() => {
    return () => clearState();
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
      <DialogContent className={classes.dialogContent}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="fit-content"
          className={classes.thumbnailContainer}
        >
          {dataUrl ? (
            <CardMedia className={classes.thumbnail} image={dataUrl} />
          ) : (
            <Skeleton
              className={classes.thumbnail}
              variant="rect"
              animation={false}
            />
          )}

          <Box position="absolute">
            <AddPhotoButton
              id="map-thumbnail-input"
              onChange={handleImagesChange}
              color="inherit"
            />
          </Box>
        </Box>

        <TextField
          label={I18n.t('map name')}
          onChange={e => handleMapNameChange(e.target.value)}
          error={errorMapName ? true : false}
          helperText={errorMapName}
          fullWidth
          autoFocus
          required
          value={name}
          variant="outlined"
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
          variant="outlined"
        />

        <PlaceAutocomplete
          onChange={handlePlaceChange}
          defaultValue={currentMap ? currentMap.base : null}
          label={I18n.t('map base')}
        />

        <ListSubheader disableGutters>{I18n.t('options')}</ListSubheader>
        <div>
          <FormControlLabel
            control={
              <Switch checked={shared} onChange={handleSharedFlugChange} />
            }
            label={
              <Typography variant="subtitle2" color="inherit">
                <Box display="flex" alignItems="center">
                  <GroupIcon className={classes.selectionIcon} />
                  {I18n.t('allow followers to post')}
                </Box>
              </Typography>
            }
            className={classes.controlLabel}
          />
        </div>
        <div>
          <FormControlLabel
            control={
              <Switch checked={privateMap} onChange={handlePrivateFlugChange} />
            }
            label={
              <Typography variant="subtitle2" color="inherit">
                <Box display="flex" alignItems="center">
                  <LockIcon className={classes.selectionIcon} />
                  {I18n.t('set this map to private')}
                </Box>
              </Typography>
            }
            className={classes.controlLabel}
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
              <Typography variant="subtitle2" color="inherit">
                <Box display="flex" alignItems="center">
                  <PersonAddIcon className={classes.selectionIcon} />
                  {I18n.t('allow followers to invite')}
                </Box>
              </Typography>
            }
            className={classes.controlLabel}
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
