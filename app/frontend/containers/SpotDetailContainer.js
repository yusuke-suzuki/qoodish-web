import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import SpotDetail from '../ui/SpotDetail';
import ApiClient from './ApiClient.js';
import selectPlaceForReview from '../actions/selectPlaceForReview';
import openToast from '../actions/openToast';
import fetchSpot from '../actions/fetchSpot';
import fetchSpotReviews from '../actions/fetchSpotReviews';
import loadSpotStart from '../actions/loadSpotStart';
import loadSpotEnd from '../actions/loadSpotEnd';
import clearSpotState from '../actions/clearSpotState';
import updatePageTitle from '../actions/updatePageTitle';
import openReviewDialog from '../actions/openReviewDialog';

const mapStateToProps = state => {
  return {
    currentSpot: state.spotDetail.currentSpot,
    spotReviews: state.spotDetail.spotReviews,
    spotLoading: state.spotDetail.spotLoading,
    large: state.shared.large,
    defaultCenter: state.gMap.defaultCenter,
    defaultZoom: state.gMap.defaultZoom
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updatePageTitle: () => {
      dispatch(updatePageTitle('Spot'));
    },

    fetchSpot: async () => {
      dispatch(loadSpotStart());
      const client = new ApiClient();
      let response = await client.fetchSpot(ownProps.match.params.placeId);
      let json = await response.json();
      dispatch(loadSpotEnd());
      if (response.ok) {
        dispatch(fetchSpot(json));
      } else if (response.status == 401) {
        dispatch(signOut());
        dispatch(openToast('Authenticate failed'));
      } else if (response.status == 404) {
        dispatch(openToast('Spot not found.'));
      } else {
        dispatch(openToast('Failed to fetch Spot.'));
      }
    },

    fetchSpotReviews: async () => {
      const client = new ApiClient();
      let response = await client.fetchSpotReviews(
        ownProps.match.params.placeId
      );
      let json = await response.json();
      if (response.ok) {
        dispatch(fetchSpotReviews(json));
      }
    },

    handleCreateReviewClick: spot => {
      let place = {
        description: spot.name,
        placeId: spot.place_id
      };
      dispatch(selectPlaceForReview(place));
    },

    handleReviewClick: (review) => {
      dispatch(openReviewDialog(review));
    },

    clear: () => {
      dispatch(clearSpotState());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SpotDetail);
