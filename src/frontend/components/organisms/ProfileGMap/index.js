import React from 'react';
import { connect } from 'react-redux';
import ProfileGMap from './ProfileGMap';

const mapStateToProps = state => {
  return {
    large: state.shared.large,
    defaultZoom: state.gMap.defaultZoom,
    center: state.gMap.center
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default React.memo(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ProfileGMap)
);
