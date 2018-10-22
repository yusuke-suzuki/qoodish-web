import { connect } from 'react-redux';
import CurrentPositionMarker from '../ui/CurrentPositionMarker';

const mapStateToProps = state => {
  return {
    currentPosition: state.gMap.currentPosition,
    currentUser: state.app.currentUser,
    large: state.shared.large
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CurrentPositionMarker);
