import React, { useState, useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import { useHistory } from '@yusuke-suzuki/rize-router';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import I18n from '../../utils/I18n';

import deleteMap from '../../actions/deleteMap';
import closeDeleteMapDialog from '../../actions/closeDeleteMapDialog';
import openToast from '../../actions/openToast';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';

import { MapsApi } from 'qoodish_api';

const DeleteMapDialog = () => {
  const mapState = useCallback(
    state => ({
      currentMap: state.maps.targetMap,
      dialogOpen: state.maps.deleteMapDialogOpen
    }),
    []
  );
  const { currentMap, dialogOpen } = useMappedState(mapState);
  const dispatch = useDispatch();
  const history = useHistory();

  const [check, setCheck] = useState(false);
  const [disabled, setDisabled] = useState(true);

  const handleCheckChange = useCallback(() => {
    setCheck(!check);
    setDisabled(!disabled);
  });

  const handleRequestDialogClose = useCallback(() => {
    dispatch(closeDeleteMapDialog());
    setCheck(false);
    setDisabled(true);
  });

  const handleDeleteButtonClick = useCallback(() => {
    dispatch(requestStart());
    const apiInstance = new MapsApi();

    apiInstance.mapsMapIdDelete(currentMap.id, (error, data, response) => {
      dispatch(requestFinish());

      if (response.ok) {
        dispatch(closeDeleteMapDialog());
        dispatch(deleteMap(currentMap.id));
        history.push('');
        dispatch(openToast(I18n.t('delete map success')));
      } else {
        dispatch(openToast('Failed to delete map.'));
      }
    });
  });

  return (
    <Dialog open={dialogOpen} onClose={handleRequestDialogClose} fullWidth>
      <DialogTitle>{I18n.t('sure to delete map')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{I18n.t('delete map detail')}</DialogContentText>
        <br />
        <FormControlLabel
          control={<Checkbox checked={check} onChange={handleCheckChange} />}
          label={I18n.t('understand this cannot be undone')}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleRequestDialogClose}>{I18n.t('cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleDeleteButtonClick}
          color="primary"
          disabled={disabled}
        >
          {I18n.t('delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(DeleteMapDialog);
