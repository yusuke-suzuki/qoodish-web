import { connect } from 'react-redux';
import PlaceSelectDialog from '../ui/PlaceSelectDialog';
import ApiClient from './ApiClient';
import closePlaceSelectDialog from '../actions/closePlaceSelectDialog';
import selectPlaceForReview from '../actions/selectPlaceForReview';
import searchPlaces from '../actions/searchPlaces';
import loadPlacesStart from '../actions/loadPlacesStart';
import loadPlacesEnd from '../actions/loadPlacesEnd';

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

export default connect(mapStateToProps, mapDispatchToProps)(PlaceSelectDialog);
