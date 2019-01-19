import React, { useState, useCallback, useEffect } from 'react';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';
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
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Chip from '@material-ui/core/Chip';
import PlaceIcon from '@material-ui/icons/Place';
import Avatar from '@material-ui/core/Avatar';
import LockIcon from '@material-ui/icons/Lock';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import GroupIcon from '@material-ui/icons/Group';
import ListSubheader from '@material-ui/core/ListSubheader';
import I18n from '../../utils/I18n';

import openBaseSelectDialog from '../../actions/openBaseSelectDialog';

const styles = {
  flex: {
    flex: 1
  },
  dialogContentLarge: {},
  dialogContentSmall: {
    paddingTop: 80
  },
  toolbar: {
    paddingLeft: 8,
    height: 56
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
    marginLeft: 10
  },
  controlLabel: {
    width: '100%'
  }
};

const Transition = props => {
  return <Slide direction="up" {...props} />;
};

const SharedEditMapDialog = props => {
  const [mapId, setMapId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privateMap, setPrivateMap] = useState(false);
  const [invitable, setInvitable] = useState(false);
  const [shared, setShared] = useState(false);
  const [errorMapName, setErrorMapName] = useState(undefined);
  const [errorDescription, setErrorDescription] = useState(undefined);
  const [disabled, setDisabled] = useState(undefined);

  useEffect(
    () => {
      if (name && description && !errorMapName && !errorDescription) {
        setDisabled(false);
      } else {
        setDisabled(true);
      }
    },
    [name, description]
  );

  const large = useMediaQuery('(min-width: 600px)');

  const dispatch = useDispatch();

  const setCurrentMap = useCallback(
    () => {
      if (props.currentMap) {
        setMapId(props.currentMap.id);
        setName(props.currentMap.name);
        setDescription(props.currentMap.description);
        setPrivateMap(props.currentMap.private);
        setInvitable(props.currentMap.invitable);
        setShared(props.currentMap.shared);
        setDisabled(true);
      }
    },
    [props.currentMap]
  );

  const clearState = useCallback(() => {
    setMapId('');
    setName('');
    setDescription('');
    setPrivateMap(false);
    setInvitable(false);
    setShared(false);
    setErrorMapName(undefined);
    setErrorDescription(undefined);
    setDisabled(true);
  });

  const handleMapNameChange = useCallback(input => {
    if (input) {
      if (name.length > 30) {
        setErrorMapName(I18n.t('max characters 30'));
      } else {
        setErrorMapName(undefined);
      }
    } else {
      setErrorMapName(I18n.t('map name is required'));
    }
    setName(input);
  });

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
  });

  const handlePrivateFlugChange = useCallback((e, checked) => {
    setPrivateMap(checked);
  });

  const handleInvitableFlugChange = useCallback((e, checked) => {
    setInvitable(checked);
  });

  const handleSharedFlugChange = useCallback((e, checked) => {
    setShared(checked);
  });

  const handleSaveButtonClick = useCallback(() => {
    let params = {
      map_id: mapId,
      name: name,
      description: description,
      base_id: props.selectedBase ? props.selectedBase.placeId : '',
      base_name: props.selectedBase ? props.selectedBase.description : '',
      private: privateMap,
      invitable: invitable,
      shared: shared
    };
    props.handleSaveButtonClick(params);
  });

  const handleMapBaseClick = useCallback(() => {
    dispatch(openBaseSelectDialog());
  });

  return (
    <Dialog
      open={props.dialogOpen}
      onClose={props.handleRequestDialogClose}
      onEnter={setCurrentMap}
      onExit={clearState}
      disableBackdropClick
      disableEscapeKeyDown
      fullWidth
      fullScreen={!large}
      TransitionComponent={Transition}
    >
      {large ? (
        <DialogTitle>
          {props.currentMap ? I18n.t('edit map') : I18n.t('create new map')}
        </DialogTitle>
      ) : (
        <AppBar color="primary">
          <Toolbar style={styles.toolbar}>
            <IconButton
              color="inherit"
              onClick={props.handleRequestDialogClose}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" style={styles.flex}>
              {props.currentMap ? I18n.t('edit map') : I18n.t('create new map')}
            </Typography>
            <Button
              variant="contained"
              onClick={handleSaveButtonClick}
              color="secondary"
              disabled={disabled}
            >
              {I18n.t('save')}
            </Button>
          </Toolbar>
        </AppBar>
      )}
      <DialogContent
        style={large ? styles.dialogContentLarge : styles.dialogContentSmall}
      >
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
        />
        <Chip
          avatar={
            <Avatar>
              <PlaceIcon />
            </Avatar>
          }
          label={
            props.selectedBase
              ? props.selectedBase.description
              : I18n.t('center of map')
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
                {I18n.t('allow followers to post')}
                <GroupIcon style={styles.selectionIcon} />
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
                {I18n.t('set this map to private')}
                <LockIcon style={styles.selectionIcon} />
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
                {I18n.t('allow followers to invite')}
                <PersonAddIcon style={styles.selectionIcon} />
              </Typography>
            }
            style={styles.controlLabel}
          />
        </div>
      </DialogContent>
      {large && (
        <DialogActions>
          <Button onClick={props.handleRequestDialogClose}>
            {I18n.t('cancel')}
          </Button>
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

export default React.memo(SharedEditMapDialog);
