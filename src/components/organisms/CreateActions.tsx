import React, { useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import EditIcon from '@material-ui/icons/Edit';
import MapIcon from '@material-ui/icons/Map';
import Dialog from '@material-ui/core/Dialog';
import I18n from '../../utils/I18n';

import openCreateMapDialog from '../../actions/openCreateMapDialog';
import selectPlaceForReview from '../../actions/selectPlaceForReview';
import openPlaceSelectDialog from '../../actions/openPlaceSelectDialog';
import closeCreateActions from '../../actions/closeCreateActions';
import { useTheme } from '@material-ui/core';

const ActionsList = () => {
  const mapState = useCallback(state => state.spotDetail.currentSpot, []);
  const spot = useMappedState(mapState);

  const dispatch = useDispatch();

  const handleCreateReviewButtonClick = useCallback(() => {
    if (spot) {
      dispatch(
        selectPlaceForReview({
          description: spot.name,
          placeId: spot.place_id
        })
      );
    } else {
      dispatch(openPlaceSelectDialog());
    }
  }, [dispatch, spot]);

  const handleCreateMapButtonClick = useCallback(() => {
    dispatch(openCreateMapDialog());
  }, [dispatch]);

  return (
    <List>
      <ListItem
        button
        key="review"
        onClick={handleCreateReviewButtonClick}
        data-test="create-review-button"
      >
        <ListItemIcon>
          <EditIcon />
        </ListItemIcon>
        <ListItemText primary={I18n.t('create new report')} />
      </ListItem>
      <ListItem
        button
        key="map"
        onClick={handleCreateMapButtonClick}
        data-test="create-map-button"
      >
        <ListItemIcon>
          <MapIcon />
        </ListItemIcon>
        <ListItemText primary={I18n.t('create new map')} />
      </ListItem>
    </List>
  );
};

const CreateActions = () => {
  const mapState = useCallback(state => state.shared.createActionsOpen, []);
  const open = useMappedState(mapState);
  const dispatch = useDispatch();
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const handleCloseDrawer = useCallback(() => {
    dispatch(closeCreateActions());
  }, [dispatch]);

  return smUp ? (
    <Dialog open={open} onClose={handleCloseDrawer} fullWidth>
      <ActionsList />
    </Dialog>
  ) : (
    <Drawer anchor="bottom" open={open} onClose={handleCloseDrawer}>
      <ActionsList />
    </Drawer>
  );
};

export default React.memo(CreateActions);
