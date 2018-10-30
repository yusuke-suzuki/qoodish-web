import { connect } from 'react-redux';
import MapFollowersList from '../ui/MapFollowersList';

const mapStateToProps = state => {
  return {
    followers: state.mapSummary.followers,
    large: state.shared.large
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MapFollowersList);
