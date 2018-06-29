import { connect } from 'react-redux';
import MapBottomSeat from '../ui/MapBottomSeat';
import switchSummary from '../actions/switchSummary';

const mapStateToProps = state => {
  return {
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleShowTimelineClick: () => {
      dispatch(switchSummary());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MapBottomSeat);
