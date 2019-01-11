import React from 'react';
import { connect } from 'react-redux';
import ReviewCard from './ReviewCard';

const mapStateToProps = state => {
  return {
    large: state.shared.large,
    currentUser: state.app.currentUser
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default React.memo(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ReviewCard)
);
