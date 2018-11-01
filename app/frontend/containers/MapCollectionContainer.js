import React from 'react';
import { connect } from 'react-redux';
import MapCollection from '../ui/MapCollection';
import openToast from '../actions/openToast';
import selectMap from '../actions/selectMap';

const mapStateToProps = state => {
  return {
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleClickMap: map => {
      dispatch(selectMap(map));
      dispatch(openToast(`Log in to ${map.name}!`));
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(MapCollection));
