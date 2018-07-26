import { connect } from 'react-redux';
import FollowMapButton from '../ui/FollowMapButton';
import openJoinMapDialog from '../actions/openJoinMapDialog';
import openLeaveMapDialog from '../actions/openLeaveMapDialog';
import openSignInRequiredDialog from '../actions/openSignInRequiredDialog';

const mapStateToProps = state => {
  return {
    currentUser: state.app.currentUser
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleJoinButtonClick: (currentUser) => {
      if (currentUser.isAnonymous) {
        dispatch(openSignInRequiredDialog());
        return;
      }
      dispatch(openJoinMapDialog());
    },

    handleLeaveButtonClick: () => {
      dispatch(openLeaveMapDialog());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FollowMapButton);
