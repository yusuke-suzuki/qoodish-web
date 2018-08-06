import { connect } from 'react-redux';
import CreateReviewButton from '../ui/CreateReviewButton';
import openPlaceSelectDialog from '../actions/openPlaceSelectDialog';
import selectPlaceForReview from '../actions/selectPlaceForReview';
import openSignInRequiredDialog from '../actions/openSignInRequiredDialog';

const mapStateToProps = state => {
  return {
    large: state.shared.large,
    currentUser: state.app.currentUser
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleButtonClick: (currentUser) => {
      if (currentUser.isAnonymous) {
        dispatch(openSignInRequiredDialog());
        return;
      }
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
