import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import NavBar from '../ui/NavBar';

const mapStateToProps = state => {
  return {
    mapsTabActive: state.shared.mapsTabActive,
    previousLocation: state.shared.previousLocation,
    isMapDetail: state.shared.isMapDetail,
    large: state.shared.large
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleBackButtonClick: (previousLocation) => {
      if (previousLocation) {
        ownProps.history.goBack();
      } else {
        ownProps.history.push('/');
      }
    }
  };
};

export default React.memo(withRouter(connect(mapStateToProps, mapDispatchToProps)(NavBar)));
