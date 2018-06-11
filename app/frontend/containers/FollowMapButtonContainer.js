import { connect } from 'react-redux';
import FollowMapButton from '../ui/FollowMapButton';
import openJoinMapDialog from '../actions/openJoinMapDialog';
import openLeaveMapDialog from '../actions/openLeaveMapDialog';


const mapStateToProps = state => {
  return {
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleJoinButtonClick: () => {
      dispatch(openJoinMapDialog());
    },

    handleLeaveButtonClick: () => {
      dispatch(openLeaveMapDialog());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FollowMapButton);
