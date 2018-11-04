import React from 'react';
import { connect } from 'react-redux';
import Terms from '../ui/Terms';

const mapStateToProps = state => {
  return {
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
  return {
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(Terms));
