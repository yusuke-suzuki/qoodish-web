import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';
import I18n from '../../utils/I18n';

import ApiClient from '../../utils/ApiClient';
import leaveMap from '../../actions/leaveMap';
import closeLeaveMapDialog from '../../actions/closeLeaveMapDialog';
import openToast from '../../actions/openToast';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';
import fetchCollaborators from '../../actions/fetchCollaborators';

const Transition = props => {
  return <Slide direction="up" {...props} />;
};

const LeaveMapDialog = () => {
  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      dialogOpen: state.maps.leaveMapDialogOpen,
      currentMap: state.maps.targetMap
    }),
    []
  );
  const { dialogOpen, currentMap } = useMappedState(mapState);

  const handleRequestClose = useCallback(() => {
    dispatch(closeLeaveMapDialog());
  });

  const handleLeaveButtonClick = useCallback(async () => {
    dispatch(requestStart());
    const client = new ApiClient();
    let response = await client.unfollowMap(currentMap.id);
    dispatch(requestFinish());
    if (response.ok) {
      let map = await response.json();
      dispatch(leaveMap(map));
      dispatch(openToast(I18n.t('unfollow map success')));

      gtag('event', 'unfollow', {
        event_category: 'engagement',
        event_label: 'map'
      });

      let colloboratorsResponse = await client.fetchCollaborators(map.id);
      let collaborators = await colloboratorsResponse.json();
      dispatch(fetchCollaborators(collaborators));
    } else {
      dispatch(openToast('Failed to unfollow map'));
    }
  });

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleRequestClose}
      fullWidth
      TransitionComponent={Transition}
    >
      <DialogTitle>{I18n.t('sure to unfollow map')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{I18n.t('unfollow map detail')}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleRequestClose}>{I18n.t('cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleLeaveButtonClick}
          color="primary"
        >
          {I18n.t('unfollow')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(LeaveMapDialog);
