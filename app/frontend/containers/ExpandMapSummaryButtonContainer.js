import { connect } from 'react-redux';
import ExpandMapSummaryButton from '../ui/ExpandMapSummaryButton';
import switchSummary from '../actions/switchSummary';

const mapStateToProps = state => {
  return {
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleShowTimelineClick: () => {
      dispatch(switchSummary());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ExpandMapSummaryButton);
