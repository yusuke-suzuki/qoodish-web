import React from 'react';
import { connect } from 'react-redux';
import Privacy from '../ui/Privacy';

const mapStateToProps = state => {
  return {
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
  return {
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(Privacy));
