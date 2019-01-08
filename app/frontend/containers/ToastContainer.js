import React from 'react';
import { connect } from 'react-redux';
import Toast from '../ui/Toast';
import closeToast from '../actions/closeToast';

const mapStateToProps = state => {
  return {
    toastOpen: state.shared.toastOpen,
    toastMessage: state.shared.toastMessage,
    toastDuration: state.shared.toastDuration
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleRequestClose: () => {
      dispatch(closeToast());
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(Toast));
