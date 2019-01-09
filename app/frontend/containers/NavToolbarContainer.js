import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import NavToolbar from '../ui/NavToolbar';
import openSearchMapsDialog from '../actions/openSearchMapsDialog';

const mapStateToProps = state => {
  return {
    currentUser: state.app.currentUser,
    large: state.shared.large,
    pageTitle: state.shared.pageTitle,
    showBackButton: state.shared.showBackButton,
    previousLocation: state.shared.previousLocation
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleBackButtonClick: previousLocation => {
      if (previousLocation) {
        ownProps.history.goBack();
      } else {
        ownProps.history.push('/');
      }
    },

    handleSearchButtonClick: () => {
      dispatch(openSearchMapsDialog());
    }
  };
};

export default React.memo(
  withRouter(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(NavToolbar)
  )
);
