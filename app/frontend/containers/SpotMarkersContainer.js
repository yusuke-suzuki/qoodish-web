import { connect } from 'react-redux';
import SpotMarkers from '../ui/SpotMarkers';
import openSpotCard from '../actions/openSpotCard';
import selectSpot from '../actions/selectSpot';

const mapStateToProps = state => {
  return {
    spots: state.gMap.spots
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onSpotMarkerClick: async spot => {
      dispatch(selectSpot(spot));
      dispatch(openSpotCard());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SpotMarkers);
