import React from 'react';
import { connect } from 'react-redux';
import CreateResourceButton from '../ui/CreateResourceButton';
import openCreateActions from '../actions/openCreateActions';
import openSignInRequiredDialog from '../actions/openSignInRequiredDialog';

const mapStateToProps = state => {
  return {
    large: state.shared.large,
    currentUser: state.app.currentUser
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleButtonClick: (currentUser) => {
      if (currentUser.isAnonymous) {
        dispatch(openSignInRequiredDialog());
        return;
      }
      dispatch(openCreateActions());
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(CreateResourceButton));
