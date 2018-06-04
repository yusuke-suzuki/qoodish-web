import { connect } from 'react-redux';
import LocationButton from '../ui/LocationButton';
import { fetchCurrentPosition } from './Utils';
import getCurrentPosition from '../actions/getCurrentPosition';
import requestCurrentPosition from '../actions/requestCurrentPosition';

const mapStateToProps = state => {
  return {
    large: state.shared.large
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
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

export default connect(mapStateToProps, mapDispatchToProps)(LocationButton);
