import React from 'react';
import { connect } from 'react-redux';
import MapBottomSeat from '../ui/MapBottomSeat';
import switchSummary from '../actions/switchSummary';

const mapStateToProps = state => {
  return {
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleSummaryOpen: () => {
      dispatch(switchSummary());
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(MapBottomSeat));
