import React from 'react';
import { connect } from 'react-redux';
import MapsTab from '../ui/MapsTab';
import switchMyMaps from '../actions/switchMyMaps';
import switchFollowingMaps from '../actions/switchFollowingMaps';

const mapStateToProps = state => {
  return {
    large: state.shared.large,
    mapsTabValue: state.maps.tabValue
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleFollowingMapsTabClick: () => {
      dispatch(switchFollowingMaps());
    },

    handleMyMapsTabClick: () => {
      dispatch(switchMyMaps());
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(MapsTab));
