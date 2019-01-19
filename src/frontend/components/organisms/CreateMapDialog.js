import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import { withRouter } from 'react-router-dom';

import SharedEditMapDialog from './SharedEditMapDialog';

import ApiClient from '../../utils/ApiClient';
import selectMap from '../../actions/selectMap';
import createMap from '../../actions/createMap';
import closeCreateMapDialog from '../../actions/closeCreateMapDialog';
import openToast from '../../actions/openToast';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';

import I18n from '../../utils/I18n';

const CreateMapDialog = props => {
  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      dialogOpen: state.maps.createMapDialogOpen,
      selectedBase: state.maps.selectedBase
    }),
    []
  );
  const { dialogOpen, selectedBase } = useMappedState(mapState);

  const handleRequestDialogClose = useCallback(() => {
    dispatch(closeCreateMapDialog());
  });

  const handleSaveButtonClick = useCallback(async params => {
    dispatch(requestStart());
    const client = new ApiClient();
    let response = await client.createMap(params);
    let json = await response.json();
    dispatch(requestFinish());
    if (response.ok) {
      dispatch(createMap(json));
      dispatch(closeCreateMapDialog());
      dispatch(selectMap(json));
      props.history.push(`/maps/${json.id}`);
      dispatch(openToast(I18n.t('create map success')));

      gtag('event', 'create', {
        event_category: 'engagement',
        event_label: 'map'
      });
    } else if (response.status == 409) {
      dispatch(openToast(json.detail));
    } else {
      dispatch(openToast('Failed to create map.'));
    }
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

export default React.memo(withRouter(CreateMapDialog));
