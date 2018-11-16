import React from 'react';
import { connect } from 'react-redux';
import SearchBar from '../ui/SearchBar';

import ApiClient from './ApiClient';
import searchMaps from '../actions/searchMaps';
import loadMapsStart from '../actions/loadMapsStart';
import loadMapsEnd from '../actions/loadMapsEnd';

const mapStateToProps = state => {
  return {
    loadingMaps: state.shared.loadingMaps,
    pickedMaps: state.shared.pickedMaps
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
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(SearchBar));
