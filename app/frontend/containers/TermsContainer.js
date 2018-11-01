import React from 'react';
import { connect } from 'react-redux';
import Terms from '../ui/Terms';
import updatePageTitle from '../actions/updatePageTitle';

const mapStateToProps = state => {
  return {
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updatePageTitle: (title) => {
      dispatch(updatePageTitle(title));
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(Terms));
