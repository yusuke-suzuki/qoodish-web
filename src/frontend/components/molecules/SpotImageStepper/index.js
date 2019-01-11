import React from 'react';
import { connect } from 'react-redux';
import SpotImageStepper from './SpotImageStepper';

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

export default React.memo(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SpotImageStepper)
);
