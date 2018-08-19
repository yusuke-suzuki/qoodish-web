import { connect } from 'react-redux';
import MapReviewsList from '../ui/MapReviewsList';
import requestMapCenter from '../actions/requestMapCenter';
import openReviewDialog from '../actions/openReviewDialog';
import selectSpot from '../actions/selectSpot';
import fetchMapReviews from '../actions/fetchMapReviews';
import ApiClient from './ApiClient';

const mapStateToProps = state => {
  return {
    mapReviews: state.mapSummary.mapReviews
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchMapReviews: async () => {
      const client = new ApiClient();
      let response = await client.fetchMapReviews(ownProps.mapId);
      if (response.ok) {
        let reviews = await response.json();
        dispatch(fetchMapReviews(reviews));
      }
    },

    handleReviewClick: (review) => {
      dispatch(selectSpot(review.spot));
      dispatch(requestMapCenter(review.spot.lat, review.spot.lng));
      dispatch(openReviewDialog(review));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MapReviewsList);
