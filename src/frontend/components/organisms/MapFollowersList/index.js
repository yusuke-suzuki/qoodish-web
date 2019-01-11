import React from 'react';
import { connect } from 'react-redux';
import MapFollowersList from './MapFollowersList';

const mapStateToProps = state => {
  return {
    followers: state.mapSummary.followers,
    large: state.shared.large
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default React.memo(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(MapFollowersList)
);
