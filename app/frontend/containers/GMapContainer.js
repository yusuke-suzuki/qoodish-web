import { connect } from 'react-redux';
import GMap from '../ui/GMap';
import gMapMounted from '../actions/gMapMounted';
import mapZoomChanged from '../actions/mapZoomChanged';
import mapCenterChanged from '../actions/mapCenterChanged';

const mapStateToProps = state => {
  return {
    large: state.shared.large,
    gMap: state.gMap.gMap,
    currentMap: state.mapDetail.currentMap,
    defaultCenter: state.gMap.defaultCenter,
    defaultZoom: state.gMap.defaultZoom,
    center: state.gMap.center,
    zoom: state.gMap.zoom,
    directions: state.gMap.directions,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onMapMounted: map => {
      dispatch(gMapMounted(map));
    },

    onZoomChanged: zoom => {
      dispatch(mapZoomChanged(zoom));
    },

    onCenterChanged: center => {
      dispatch(mapCenterChanged({ lat: center.lat(), lng: center.lng() }));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GMap);
