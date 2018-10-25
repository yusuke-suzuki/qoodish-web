import { connect } from 'react-redux';
import MapSummaryCard from '../ui/MapSummaryCard';

const mapStateToProps = state => {
  return {
    currentMap: state.mapSummary.currentMap,
    large: state.shared.large
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MapSummaryCard);
