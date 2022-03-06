import React, { forwardRef, useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Slide, { SlideProps } from '@material-ui/core/Slide';
import Fade from '@material-ui/core/Fade';
import I18n from '../../utils/I18n';

import leaveMap from '../../actions/leaveMap';
import closeLeaveMapDialog from '../../actions/closeLeaveMapDialog';
import openToast from '../../actions/openToast';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';
import fetchCollaborators from '../../actions/fetchCollaborators';

import {
  CollaboratorsApi,
  FollowsApi
} from '@yusuke-suzuki/qoodish-api-js-client';
import { useTheme } from '@material-ui/core';

const Transition = forwardRef(function Transition(props: SlideProps, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const LeaveMapDialog = () => {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
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
  }, [dispatch]);

  const handleLeaveButtonClick = useCallback(async () => {
    dispatch(requestStart());
    const apiInstance = new FollowsApi();

    apiInstance.mapsMapIdFollowDelete(
      currentMap.id,
      (error, data, response) => {
        dispatch(requestFinish());
        if (response.ok) {
          dispatch(leaveMap(response.body));
          dispatch(openToast(I18n.t('unfollow map success')));

          const apiInstance = new CollaboratorsApi();

          apiInstance.mapsMapIdCollaboratorsGet(
            currentMap.id,
            (error, data, response) => {
              if (response.ok) {
                dispatch(fetchCollaborators(response.body));
              } else {
                console.log('API called successfully. Returned data: ' + data);
              }
            }
          );
        } else {
          dispatch(openToast('Failed to unfollow map'));
          console.log('API called successfully. Returned data: ' + data);
        }
      }
    );
  }, [dispatch, currentMap]);

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleRequestClose}
      fullWidth
      TransitionComponent={smUp ? Fade : Transition}
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
