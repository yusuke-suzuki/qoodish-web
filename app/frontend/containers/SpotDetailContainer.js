import { connect } from 'react-redux';
import SpotDetail from '../ui/SpotDetail';
import ApiClient from './ApiClient.js';
import openToast from '../actions/openToast';
import fetchSpot from '../actions/fetchSpot';
import fetchSpotReviews from '../actions/fetchSpotReviews';
import loadSpotStart from '../actions/loadSpotStart';
import loadSpotEnd from '../actions/loadSpotEnd';
import clearSpotState from '../actions/clearSpotState';
import updatePageTitle from '../actions/updatePageTitle';
import openReviewDialog from '../actions/openReviewDialog';
import I18n from './I18n';

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
      dispatch(updatePageTitle(I18n.t('spot')));
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

    handleReviewClick: (review) => {
      dispatch(openReviewDialog(review));
    },

    clear: () => {
      dispatch(clearSpotState());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SpotDetail);
