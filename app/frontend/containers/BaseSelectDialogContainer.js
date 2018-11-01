import React from 'react';
import { connect } from 'react-redux';
import PlaceSelectDialog from '../ui/PlaceSelectDialog';
import ApiClient from './ApiClient';
import closeBaseSelectDialog from '../actions/closeBaseSelectDialog';
import selectMapBase from '../actions/selectMapBase';
import searchPlaces from '../actions/searchPlaces';
import loadPlacesStart from '../actions/loadPlacesStart';
import loadPlacesEnd from '../actions/loadPlacesEnd';

const mapStateToProps = state => {
  return {
    dialogOpen: state.maps.baseSelectDialogOpen,
    places: state.shared.pickedPlaces,
    loadingPlaces: state.shared.loadingPlaces,
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onClose: () => {
      dispatch(closeBaseSelectDialog());
    },

    onPlaceSelected: place => {
      dispatch(selectMapBase(place));
    },

    handleInputChange: async input => {
      dispatch(loadPlacesStart());
      const client = new ApiClient();
      let response = await client.searchPlaces(input);
      let places = await response.json();
      dispatch(loadPlacesEnd());
      if (response.ok) {
        dispatch(searchPlaces(places));
      }
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(PlaceSelectDialog));
