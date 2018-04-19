import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import MapCollection from '../ui/MapCollection';
import openToast from '../actions/openToast';
import selectMap from '../actions/selectMap';

const mapStateToProps = state => {
  return {
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleClickMap: map => {
      dispatch(selectMap(map));
      dispatch(push(`/maps/${map.id}`, {
        previous: true
      }));
      dispatch(openToast(`Log in to ${map.name}!`));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MapCollection);
