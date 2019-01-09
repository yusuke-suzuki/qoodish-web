import React from 'react';
import { connect } from 'react-redux';
import SpotCard from '../ui/SpotCard';
import openSpotCard from '../actions/openSpotCard';
import closeSpotCard from '../actions/closeSpotCard';
import openToast from '../actions/openToast';
import requestRoute from '../actions/requestRoute';
import openReviewDialog from '../actions/openReviewDialog';
import selectPlaceForReview from '../actions/selectPlaceForReview';

import fetchCurrentPosition from '../utils/fetchCurrentPosition';
import getCurrentPosition from '../actions/getCurrentPosition';
import requestMapCenter from '../actions/requestMapCenter';
import switchMap from '../actions/switchMap';

const mapStateToProps = state => {
  return {
    open: state.spotCard.spotCardOpen,
    currentSpot: state.spotCard.currentSpot,
    large: state.shared.large,
    spotReviews: state.mapSummary.spotReviews,
    currentMap: state.mapDetail.currentMap,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleOpen: () => {
      dispatch(openSpotCard());
    },

    handleClose: () => {
      dispatch(closeSpotCard());
    },

    handleLocationButtonClick: (spot) => {
      dispatch(requestMapCenter(spot.lat, spot.lng));
      dispatch(switchMap());
    },

    handleRouteButtonClick: async (spot) => {
      dispatch(switchMap());
      const currentPosition = await fetchCurrentPosition();
      dispatch(
        getCurrentPosition(currentPosition.coords.latitude, currentPosition.coords.longitude)
      );
      if (currentPosition) {
        const DirectionsService = new google.maps.DirectionsService();
        let origin = new google.maps.LatLng(
          parseFloat(currentPosition.coords.latitude),
          parseFloat(currentPosition.coords.longitude)
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
    },

    handleCreateReviewClick: spot => {
      let place = {
        description: spot.name,
        placeId: spot.place_id
      };
      dispatch(selectPlaceForReview(place));
    },

    handleReviewClick: review => {
      dispatch(openReviewDialog(review));
    }
  }
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(SpotCard));
