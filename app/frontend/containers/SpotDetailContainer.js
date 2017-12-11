import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import SpotDetail from '../ui/SpotDetail';
import ApiClient from './ApiClient.js';
import closeSpotDetail from '../actions/closeSpotDetail';
import selectPlaceForReview from '../actions/selectPlaceForReview';
import openToast from '../actions/openToast';
import requestRoute from '../actions/requestRoute';
import openReviewDialog from '../actions/openReviewDialog';

const mapStateToProps = (state) => {
  return {
    currentMap: state.mapDetail.currentMap,
    drawerOpen: state.spotDetail.spotDetailOpen,
    currentSpot: state.spotDetail.currentSpot,
    spotReviews: state.spotDetail.spotReviews,
    currentPosition: state.gMap.currentPosition,
    large: state.shared.large
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleCloseSpotButtonClick: () => {
      dispatch(closeSpotDetail());
    },

    handleAddReviewButtonClick: (spot) => {
      let place = {
        description: spot.name,
        placeId: spot.place_id
      };
      dispatch(selectPlaceForReview(place));
    },

    handleRouteButtonClick: (spot, currentPosition) => {
      if (currentPosition.lat && currentPosition.lng) {
        const DirectionsService = new google.maps.DirectionsService();
        let origin = new google.maps.LatLng(parseFloat(currentPosition.lat), parseFloat(currentPosition.lng));
        let destination = new google.maps.LatLng(parseFloat(spot.lat), parseFloat(spot.lng));
        DirectionsService.route({
          origin: origin,
          destination: destination,
          travelMode: google.maps.TravelMode.WALKING,
        }, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            dispatch(requestRoute(result));
          } else {
            dispatch(openToast('Error fetching direction'));
          }
        });
      } else {
        dispatch(openToast('Current position is not available. Please activate'));
        return;
      }
    },

    handleReviewClick: (review) => {
      dispatch(openReviewDialog(review));
      dispatch(push(`/maps/${review.map_id}/reports/${review.id}`));
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SpotDetail);
