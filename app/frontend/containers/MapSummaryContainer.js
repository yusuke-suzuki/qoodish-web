import { connect } from 'react-redux';
import MapSummary from '../ui/MapSummary';

const mapStateToProps = state => {
  return {
    currentUser: state.app.currentUser,
    currentMap: state.mapSummary.currentMap,
    large: state.shared.large
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MapSummary);
