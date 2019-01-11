import React from 'react';
import { connect } from 'react-redux';
import LocationButton from './LocationButton';
import fetchCurrentPosition from '../../../utils/fetchCurrentPosition';
import getCurrentPosition from '../../../actions/getCurrentPosition';
import requestCurrentPosition from '../../../actions/requestCurrentPosition';

const mapStateToProps = state => {
  return {
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleButtonClick: async () => {
      const position = await fetchCurrentPosition();
      dispatch(
        getCurrentPosition(position.coords.latitude, position.coords.longitude)
      );
      dispatch(requestCurrentPosition());
    }
  };
};

export default React.memo(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(LocationButton)
);
