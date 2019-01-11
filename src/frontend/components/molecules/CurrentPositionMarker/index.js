import React from 'react';
import { connect } from 'react-redux';
import CurrentPositionMarker from './CurrentPositionMarker';

const mapStateToProps = state => {
  return {
    currentPosition: state.gMap.currentPosition,
    currentUser: state.app.currentUser,
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default React.memo(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(CurrentPositionMarker)
);
