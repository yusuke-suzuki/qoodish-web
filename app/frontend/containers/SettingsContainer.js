import React from 'react';
import { connect } from 'react-redux';
import Settings from '../ui/Settings';
import openDeleteAccountDialog from '../actions/openDeleteAccountDialog';

const mapStateToProps = state => {
  return {
    currentUser: state.app.currentUser,
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleDeleteAccountButtonClick: () => {
      dispatch(openDeleteAccountDialog());
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(Settings));
