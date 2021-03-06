import React, { useCallback, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import PlaceIcon from '@material-ui/icons/Place';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Slide from '@material-ui/core/Slide';
import Fade from '@material-ui/core/Fade';

import I18n from '../../utils/I18n';

import searchPlaces from '../../actions/searchPlaces';
import { PlacesApi } from '@yusuke-suzuki/qoodish-api-js-client';
import DialogAppBar from '../molecules/DialogAppBar';
import { useTheme } from '@material-ui/core';

const styles = {
  placeIcon: {
    marginRight: 10
  },
  dialogPaper: {
    height: 'calc(100% - 96px)'
  },
  dialogContentLarge: {
    paddingBottom: 0
  },
  dialogContentSmall: {
    paddingTop: 24
  },
  dialogTitle: {
    display: 'flex',
    alignItems: 'center'
  }
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const SharedPlaceSelectDialog = props => {
  const { onClose, onPlaceSelected, dialogOpen, onEntered } = props;
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const places = useMappedState(
    useCallback(state => state.shared.pickedPlaces, [])
  );

  const handlePlaceSelected = useCallback(
    place => {
      let params = {
        placeId: place.place_id,
        description: place.description
      };
      onClose();
      onPlaceSelected(params);
    },
    [onClose, onPlaceSelected]
  );

  const handleInputChange = useCallback(
    async input => {
      if (loading || !input) {
        return;
      }
      setLoading(true);

      const apiInstance = new PlacesApi();
      const opts = {
        input: input
      };
      apiInstance.placesGet(opts, (error, data, response) => {
        setLoading(false);
        if (response.ok) {
          dispatch(searchPlaces(response.body));
        } else {
          console.log('API called successfully. Returned data: ' + data);
        }
      });
    },
    [dispatch, loading]
  );

  return (
    <Dialog
      open={dialogOpen}
      onEntered={onEntered}
      onClose={onClose}
      fullWidth
      fullScreen={!smUp}
      TransitionComponent={smUp ? Fade : Transition}
      PaperProps={{ style: smUp ? styles.dialogPaper : {} }}
    >
      {smUp ? (
        <DialogTitle>
          <div style={styles.dialogTitle}>
            <PlaceIcon style={styles.placeIcon} />
            {I18n.t('select place')}
          </div>
        </DialogTitle>
      ) : (
        <DialogAppBar
          title={I18n.t('select place')}
          handleRequestDialogClose={onClose}
        />
      )}
      <DialogContent
        style={smUp ? styles.dialogContentLarge : styles.dialogContentSmall}
      >
        <TextField
          label={I18n.t('search places')}
          onChange={e => handleInputChange(e.target.value)}
          fullWidth
          autoFocus
          placeholder={I18n.t('search places example')}
          helperText={I18n.t('search places help')}
          data-test="place-name-input"
        />
        <List>
          {places.map(place => (
            <ListItem
              button
              key={place.place_id}
              onClick={() => handlePlaceSelected(place)}
              data-test="place-list-item"
            >
              <ListItemAvatar>
                <Avatar>
                  <PlaceIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={place.description} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      {smUp && (
        <DialogActions>
          <Button onClick={onClose}>{I18n.t('cancel')}</Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default React.memo(SharedPlaceSelectDialog);
