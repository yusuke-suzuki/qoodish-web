import { connect } from 'react-redux';
import { push, goBack } from 'react-router-redux';
import MapSummary from '../ui/MapSummary';
import switchMap from '../actions/switchMap';

const mapStateToProps = state => {
  return {
    currentMap: state.mapSummary.currentMap,
    large: state.shared.large,
    previous: state.shared.previous
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleBackButtonClick: (previous) => {
      if (previous) {
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
