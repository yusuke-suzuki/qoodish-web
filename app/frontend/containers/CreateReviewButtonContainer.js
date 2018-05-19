import { connect } from 'react-redux';
import CreateReviewButton from '../ui/CreateReviewButton';
import openPlaceSelectDialog from '../actions/openPlaceSelectDialog';
import selectPlaceForReview from '../actions/selectPlaceForReview';

const mapStateToProps = state => {
  return {
    large: state.shared.large
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleButtonClick: () => {
      if (ownProps.spot) {
        let place = {
          description: ownProps.spot.name,
          placeId: ownProps.spot.place_id
        };
        dispatch(selectPlaceForReview(place));
      } else {
        dispatch(openPlaceSelectDialog());
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateReviewButton);
