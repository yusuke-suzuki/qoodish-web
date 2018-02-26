import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import SpotCard from '../ui/SpotCard';
import ApiClient from './ApiClient.js';
import closeSpotCard from '../actions/closeSpotCard';
import selectPlaceForReview from '../actions/selectPlaceForReview';
import openToast from '../actions/openToast';
import requestRoute from '../actions/requestRoute';
import fetchSpot from '../actions/fetchSpot';

const mapStateToProps = state => {
  return {
    currentMap: state.mapDetail.currentMap,
    open: state.spotCard.spotCardOpen,
    currentSpot: state.spotCard.currentSpot,
    currentPosition: state.gMap.currentPosition,
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleCloseSpotButtonClick: () => {
      dispatch(closeSpotCard());
    },

    handleAddReviewButtonClick: spot => {
      let place = {
        description: spot.name,
        placeId: spot.place_id
      };
      dispatch(selectPlaceForReview(place));
    },

    handleShowDetailButtonClick: spot => {
      dispatch(fetchSpot(spot));
      dispatch(push(`/spots/${spot.place_id}`));
    },

    handleRouteButtonClick: (spot, currentPosition) => {
      if (currentPosition.lat && currentPosition.lng) {
        const DirectionsService = new google.maps.DirectionsService();
        let origin = new google.maps.LatLng(
          parseFloat(currentPosition.lat),
          parseFloat(currentPosition.lng)
        );
        let destination = new google.maps.LatLng(
          parseFloat(spot.lat),
          parseFloat(spot.lng)
        );
        DirectionsService.route(
          {
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.WALKING
          },
          (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              dispatch(requestRoute(result));
            } else {
              dispatch(openToast('Error fetching direction'));
            }
          }
        );
      } else {
        dispatch(
          openToast('Current position is not available. Please activate')
        );
        return;
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SpotCard);
