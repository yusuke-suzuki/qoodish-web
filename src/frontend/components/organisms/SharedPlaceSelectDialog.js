import React, { useCallback, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

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

import I18n from '../../utils/I18n';

import searchPlaces from '../../actions/searchPlaces';
import { PlacesApi } from 'qoodish_api';
import DialogAppBar from '../molecules/DialogAppBar';

const styles = {
  placeIcon: {
    marginRight: 10
  },
  dialogContentLarge: {
    paddingBottom: 0
  },
  dialogContentSmall: {
    paddingTop: 24
  },
  dialogTitle: {
    display: 'flex'
  }
};

const Transition = props => {
  return <Slide direction="up" {...props} />;
};

const SharedPlaceSelectDialog = props => {
  const large = useMediaQuery('(min-width: 600px)');
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const places = useMappedState(
    useCallback(state => state.shared.pickedPlaces, [])
  );

  const handlePlaceSelected = useCallback(place => {
    let params = {
      placeId: place.place_id,
      description: place.description
    };
    props.onClose();
    props.onPlaceSelected(params);
  });

  const handleInputChange = useCallback(async input => {
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
  });

  return (
    <Dialog
      open={props.dialogOpen}
      onEnter={props.onEnter}
      onClose={props.onClose}
      fullWidth
      fullScreen={!large}
      TransitionComponent={Transition}
    >
      {large ? (
        <DialogTitle>
          <div style={styles.dialogTitle}>
            <PlaceIcon style={styles.placeIcon} />
            {I18n.t('select place')}
          </div>
        </DialogTitle>
      ) : (
        <DialogAppBar
          title={I18n.t('select place')}
          handleRequestDialogClose={props.onClose}
        />
      )}
      <DialogContent
        style={large ? styles.dialogContentLarge : styles.dialogContentSmall}
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
      {large && (
        <DialogActions>
          <Button onClick={props.onClose}>{I18n.t('cancel')}</Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default React.memo(SharedPlaceSelectDialog);
