import React from 'react';
import { connect } from 'react-redux';
import Login from '../ui/Login';

const mapStateToProps = state => {
  return {
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(Login));
