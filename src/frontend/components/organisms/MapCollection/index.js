import React from 'react';
import { connect } from 'react-redux';
import MapCollection from './MapCollection';
import selectMap from '../../../actions/selectMap';

const mapStateToProps = state => {
  return {
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleClickMap: map => {
      dispatch(selectMap(map));
    }
  };
};

export default React.memo(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(MapCollection)
);
