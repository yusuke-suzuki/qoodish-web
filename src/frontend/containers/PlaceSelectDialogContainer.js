import React from 'react';
import { connect } from 'react-redux';
import PlaceSelectDialog from '../ui/PlaceSelectDialog';
import ApiClient from './ApiClient';
import closePlaceSelectDialog from '../actions/closePlaceSelectDialog';
import selectPlaceForReview from '../actions/selectPlaceForReview';
import searchPlaces from '../actions/searchPlaces';
import loadPlacesStart from '../actions/loadPlacesStart';
import loadPlacesEnd from '../actions/loadPlacesEnd';
import fetchCurrentPosition from '../utils/fetchCurrentPosition';
import getCurrentPosition from '../actions/getCurrentPosition';

const mapStateToProps = state => {
  return {
    dialogOpen: state.mapDetail.placeSelectDialogOpen,
    places: state.shared.pickedPlaces,
    loadingPlaces: state.shared.loadingPlaces,
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onEnter: async () => {
      const position = await fetchCurrentPosition();
      dispatch(
        getCurrentPosition(position.coords.latitude, position.coords.longitude)
      );
      const client = new ApiClient();
      let response = await client.searchNearPlaces(
        position.coords.latitude,
        position.coords.longitude
      );
      let places = await response.json();
      if (response.ok) {
        dispatch(searchPlaces(places));
      }
    },

    onClose: () => {
      dispatch(closePlaceSelectDialog());
    },

    onPlaceSelected: place => {
      dispatch(selectPlaceForReview(place));
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

export default React.memo(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(PlaceSelectDialog)
);
