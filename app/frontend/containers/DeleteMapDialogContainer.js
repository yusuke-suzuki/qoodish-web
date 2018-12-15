import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import DeleteMapDialog from '../ui/DeleteMapDialog';
import ApiClient from './ApiClient';
import deleteMap from '../actions/deleteMap';
import closeDeleteMapDialog from '../actions/closeDeleteMapDialog';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import I18n from './I18n';

const mapStateToProps = state => {
  return {
    currentMap: state.maps.targetMap,
    dialogOpen: state.maps.deleteMapDialogOpen
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleRequestDialogClose: () => {
      dispatch(closeDeleteMapDialog());
    },

    handleDeleteButtonClick: async () => {
      dispatch(requestStart());
      const client = new ApiClient();
      await client.deleteMap(ownProps.mapId);
      dispatch(requestFinish());
      dispatch(deleteMap(ownProps.mapId));
      dispatch(closeDeleteMapDialog());
      ownProps.history.push('');
      dispatch(openToast(I18n.t('delete map success')));
    }
  };
};

export default React.memo(withRouter(connect(mapStateToProps, mapDispatchToProps)(DeleteMapDialog)));
