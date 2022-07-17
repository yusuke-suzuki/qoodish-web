import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import SharedEditMapDialog from './SharedEditMapDialog';

import editMap from '../../actions/editMap';
import closeEditMapDialog from '../../actions/closeEditMapDialog';
import openToast from '../../actions/openToast';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';

import { MapsApi, NewMap } from '@yusuke-suzuki/qoodish-api-js-client';
import { useLocale } from '../../hooks/useLocale';

const EditMapDialog = () => {
  const { I18n } = useLocale();
  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      dialogOpen: state.maps.editMapDialogOpen,
      currentMap: state.maps.targetMap
    }),
    []
  );
  const { dialogOpen, currentMap } = useMappedState(mapState);

  const handleRequestDialogClose = useCallback(() => {
    dispatch(closeEditMapDialog());
  }, [dispatch]);

  const handleSaveButtonClick = useCallback(
    async (params, mapId) => {
      dispatch(requestStart());

      const apiInstance = new MapsApi();
      const newMap = NewMap.constructFromObject(params);

      apiInstance.mapsMapIdPut(mapId, newMap, (error, data, response) => {
        dispatch(requestFinish());

        if (response.ok) {
          const map = response.body;
          dispatch(editMap(map));
          dispatch(closeEditMapDialog());
          dispatch(openToast(I18n.t('edit map success')));
        } else if (response.status === 409) {
          dispatch(openToast(response.body.detail));
        } else {
          dispatch(openToast('Failed to update map.'));
        }
      });
    },
    [dispatch]
  );

  return (
    <SharedEditMapDialog
      currentMap={currentMap}
      dialogOpen={dialogOpen}
      handleSaveButtonClick={handleSaveButtonClick}
      handleRequestDialogClose={handleRequestDialogClose}
    />
  );
};

export default React.memo(EditMapDialog);
