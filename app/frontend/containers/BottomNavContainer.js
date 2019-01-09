import React from 'react';
import { connect } from 'react-redux';
import BottomNav from '../ui/BottomNav';

const mapStateToProps = state => {
  return {
    bottomNavValue: state.shared.bottomNavValue,
    unreadNotifications: state.shared.unreadNotifications
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default React.memo(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(BottomNav)
);
