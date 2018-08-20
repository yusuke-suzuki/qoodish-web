import { connect } from 'react-redux';
import ReviewGridList from '../ui/ReviewGridList';
import openReviewDialog from '../actions/openReviewDialog';

const mapStateToProps = state => {
  return {
    large: state.shared.large
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleReviewClick: review => {
      dispatch(openReviewDialog(review));
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(ReviewGridList);
