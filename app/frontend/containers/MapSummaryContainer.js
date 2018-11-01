import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import MapSummary from '../ui/MapSummary';
import switchMap from '../actions/switchMap';

const mapStateToProps = state => {
  return {
    currentMap: state.mapSummary.currentMap,
    large: state.shared.large,
    previousLocation: state.shared.previousLocation
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
    },

    handleSummaryClose: () => {
      dispatch(switchMap());
    }
  };
};

export default React.memo(withRouter(connect(mapStateToProps, mapDispatchToProps)(MapSummary)));
