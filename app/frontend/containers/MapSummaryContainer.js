import { connect } from 'react-redux';
import { push, goBack } from 'react-router-redux';
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
        dispatch(goBack());
      } else {
        dispatch(push('/'));
      }
    },

    handleSummaryClose: () => {
      dispatch(switchMap());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MapSummary);
