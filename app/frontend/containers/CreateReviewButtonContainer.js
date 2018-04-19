import { connect } from 'react-redux';
import CreateReviewButton from '../ui/CreateReviewButton';
import openPlaceSelectDialog from '../actions/openPlaceSelectDialog';

const mapStateToProps = state => {
  return {
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleButtonClick: () => {
      dispatch(openPlaceSelectDialog());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateReviewButton);
