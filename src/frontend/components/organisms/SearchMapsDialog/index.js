import React from 'react';
import { connect } from 'react-redux';
import SearchMapsDialog from './SearchMapsDialog';

import ApiClient from '../../../utils/ApiClient';
import searchMaps from '../../../actions/searchMaps';
import loadMapsStart from '../../../actions/loadMapsStart';
import loadMapsEnd from '../../../actions/loadMapsEnd';
import closeSearchMapsDialog from '../../../actions/closeSearchMapsDialog';

const mapStateToProps = state => {
  return {
    loadingMaps: state.shared.loadingMaps,
    pickedMaps: state.shared.pickedMaps,
    dialogOpen: state.shared.searchMapsDialogOpen
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleInputChange: async input => {
      dispatch(loadMapsStart());
      const client = new ApiClient();
      let response = await client.searchMaps(input);
      let maps = await response.json();
      dispatch(loadMapsEnd());
      if (response.ok) {
        dispatch(searchMaps(maps));
      }
    },

    handleRequestClose: () => {
      dispatch(closeSearchMapsDialog());
    }
  };
};

export default React.memo(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SearchMapsDialog)
);
