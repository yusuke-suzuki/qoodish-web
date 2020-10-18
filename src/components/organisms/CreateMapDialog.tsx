import React, { memo, useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import SharedEditMapDialog from './SharedEditMapDialog';

import selectMap from '../../actions/selectMap';
import createMap from '../../actions/createMap';
import closeCreateMapDialog from '../../actions/closeCreateMapDialog';
import openToast from '../../actions/openToast';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';

import I18n from '../../utils/I18n';
import { MapsApi, NewMap } from '@yusuke-suzuki/qoodish-api-js-client';
import { useRouter } from 'next/router';

export default memo(function CreateMapDialog() {
  const dispatch = useDispatch();
  const router = useRouter();

  const mapState = useCallback(
    state => ({
      dialogOpen: state.maps.createMapDialogOpen
    }),
    []
  );
  const { dialogOpen } = useMappedState(mapState);

  const handleRequestDialogClose = useCallback(() => {
    dispatch(closeCreateMapDialog());
  }, [dispatch]);

  const handleSaveButtonClick = useCallback(
    async (params, _mapId) => {
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
          router.push(`/maps/${map.id}`);
          dispatch(openToast(I18n.t('create map success')));
        } else if (response.status === 409) {
          dispatch(openToast(response.body.detail));
        } else {
          dispatch(openToast('Failed to create map.'));
        }
      });
    },
    [dispatch, router]
  );

  return (
    <SharedEditMapDialog
      dialogOpen={dialogOpen}
      handleSaveButtonClick={handleSaveButtonClick}
      handleRequestDialogClose={handleRequestDialogClose}
    />
  );
});
