import React from 'react';
import { connect } from 'react-redux';
import AppMenuButton from '../ui/AppMenuButton';
import openDrawer from '../actions/openDrawer';
import closeDrawer from '../actions/closeDrawer';

const mapStateToProps = state => {
  return {
    large: state.shared.large,
    drawerOpen: state.shared.drawerOpen
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleToggleDrawer: (drawerOpen) => {
      if (drawerOpen) {
        dispatch(closeDrawer());
      } else {
        dispatch(openDrawer());
      }
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(AppMenuButton));
