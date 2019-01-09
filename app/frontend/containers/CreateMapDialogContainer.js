import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import EditMapDialog from '../ui/EditMapDialog';
import ApiClient from './ApiClient';
import selectMap from '../actions/selectMap';
import createMap from '../actions/createMap';
import closeCreateMapDialog from '../actions/closeCreateMapDialog';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import openBaseSelectDialog from '../actions/openBaseSelectDialog';
import I18n from './I18n';

const mapStateToProps = state => {
  return {
    dialogOpen: state.maps.createMapDialogOpen,
    large: state.shared.large,
    selectedBase: state.maps.selectedBase
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleRequestDialogClose: () => {
      dispatch(closeCreateMapDialog());
    },

    handleMapBaseClick: () => {
      dispatch(openBaseSelectDialog());
    },

    handleSaveButtonClick: async params => {
      dispatch(requestStart());
      const client = new ApiClient();
      let response = await client.createMap(params);
      let json = await response.json();
      dispatch(requestFinish());
      if (response.ok) {
        dispatch(createMap(json));
        dispatch(closeCreateMapDialog());
        dispatch(selectMap(json));
        ownProps.history.push(`/maps/${json.id}`);
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
    }
  };
};

export default React.memo(
  withRouter(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(EditMapDialog)
  )
);
