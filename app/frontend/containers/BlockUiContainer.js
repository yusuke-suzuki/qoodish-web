import React from 'react';
import { connect } from 'react-redux';
import BlockUi from '../ui/BlockUi';

const mapStateToProps = state => {
  return {
    blocking: state.shared.blocking
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(BlockUi));
