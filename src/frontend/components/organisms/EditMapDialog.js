import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import SharedEditMapDialog from './SharedEditMapDialog';

import ApiClient from '../../utils/ApiClient';
import editMap from '../../actions/editMap';
import closeEditMapDialog from '../../actions/closeEditMapDialog';
import openToast from '../../actions/openToast';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';

import I18n from '../../utils/I18n';

const EditMapDialog = () => {
  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      dialogOpen: state.maps.editMapDialogOpen,
      currentMap: state.maps.targetMap,
      selectedBase: state.maps.selectedBase
    }),
    []
  );
  const { dialogOpen, currentMap, selectedBase } = useMappedState(mapState);

  const handleRequestDialogClose = useCallback(() => {
    dispatch(closeEditMapDialog());
  });

  const handleSaveButtonClick = useCallback(async params => {
    dispatch(requestStart());
    const client = new ApiClient();
    let response = await client.editMap(params);
    let json = await response.json();
    dispatch(requestFinish());
    if (response.ok) {
      dispatch(editMap(json));
      dispatch(closeEditMapDialog());
      dispatch(openToast(I18n.t('edit map success')));
    } else if (response.status == 409) {
      dispatch(openToast(json.detail));
    } else {
      dispatch(openToast('Failed to update map.'));
    }
  });

  return (
    <SharedEditMapDialog
      currentMap={currentMap}
      selectedBase={selectedBase}
      dialogOpen={dialogOpen}
      handleSaveButtonClick={handleSaveButtonClick}
      handleRequestDialogClose={handleRequestDialogClose}
    />
  );
};

export default React.memo(EditMapDialog);
