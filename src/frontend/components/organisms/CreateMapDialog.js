import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import SharedEditMapDialog from './SharedEditMapDialog';

import selectMap from '../../actions/selectMap';
import createMap from '../../actions/createMap';
import closeCreateMapDialog from '../../actions/closeCreateMapDialog';
import openToast from '../../actions/openToast';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';

import I18n from '../../utils/I18n';
import { MapsApi, NewMap } from 'qoodish_api';

const CreateMapDialog = () => {
  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      dialogOpen: state.maps.createMapDialogOpen,
      selectedBase: state.maps.selectedBase,
      history: state.shared.history
    }),
    []
  );
  const { dialogOpen, selectedBase, history } = useMappedState(mapState);

  const handleRequestDialogClose = useCallback(() => {
    dispatch(closeCreateMapDialog());
  });

  const handleSaveButtonClick = useCallback(async (params, _mapId) => {
    dispatch(requestStart());
    const apiInstance = new MapsApi();
    const newMap = NewMap.constructFromObject(params);

    apiInstance.mapsPost(newMap, (error, data, response) => {
      dispatch(requestFinish());

      if (response.ok) {
        const map = response.body;
        dispatch(createMap(map));
        dispatch(closeCreateMapDialog());
        dispatch(selectMap(map));
        history.push(`/maps/${map.id}`);
        dispatch(openToast(I18n.t('create map success')));

        gtag('event', 'create', {
          event_category: 'engagement',
          event_label: 'map'
        });
      } else if (response.status === 409) {
        dispatch(openToast(response.body.detail));
      } else {
        dispatch(openToast('Failed to create map.'));
      }
    });
  });

  return (
    <SharedEditMapDialog
      selectedBase={selectedBase}
      dialogOpen={dialogOpen}
      handleSaveButtonClick={handleSaveButtonClick}
      handleRequestDialogClose={handleRequestDialogClose}
    />
  );
};

export default React.memo(CreateMapDialog);
