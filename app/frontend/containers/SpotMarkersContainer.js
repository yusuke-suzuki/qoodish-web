import React from 'react';
import { connect } from 'react-redux';
import SpotMarkers from '../ui/SpotMarkers';
import openSpotCard from '../actions/openSpotCard';
import selectSpot from '../actions/selectSpot';

const mapStateToProps = state => {
  return {
    spots: state.gMap.spots,
    large: state.shared.large
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

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(SpotMarkers));
