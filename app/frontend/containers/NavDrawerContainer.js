import React from 'react';
import { connect } from 'react-redux';
import NavDrawer from '../ui/NavDrawer';
import openFeedbackDialog from '../actions/openFeedbackDialog';
import openDrawer from '../actions/openDrawer';
import closeDrawer from '../actions/closeDrawer';

const mapStateToProps = state => {
  return {
    large: state.shared.large,
    pageTitle: state.shared.pageTitle,
    drawerOpen: state.shared.drawerOpen,
    showSideNav: state.shared.showSideNav
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleFeedbackClick: () => {
      dispatch(openFeedbackDialog());
    },

    handleOpenDrawer: () => {
      dispatch(openDrawer());
    },

    handleCloseDrawer: () => {
      dispatch(closeDrawer());
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(NavDrawer));
