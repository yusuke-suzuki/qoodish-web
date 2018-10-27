import { connect } from 'react-redux';
import MapSpotsList from '../ui/MapSpotsList';
import requestMapCenter from '../actions/requestMapCenter';
import selectSpot from '../actions/selectSpot';
import openSpotCard from '../actions/openSpotCard';

const mapStateToProps = state => {
  return {
    spots: state.gMap.spots,
    large: state.shared.large
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleSpotClick: async (spot) => {
      dispatch(requestMapCenter(spot.lat, spot.lng));
      dispatch(selectSpot(spot));
      dispatch(openSpotCard());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MapSpotsList);
