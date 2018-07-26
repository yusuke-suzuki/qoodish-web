import { connect } from 'react-redux';
import NoContents from '../ui/NoContents';
import openCreateMapDialog from '../actions/openCreateMapDialog';
import openPlaceSelectDialog from '../actions/openPlaceSelectDialog';
import openSignInRequiredDialog from '../actions/openSignInRequiredDialog';

const mapStateToProps = state => {
  return {
    large: state.shared.large,
    currentUser: state.app.currentUser
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleCreateMapButtonClick: (currentUser) => {
      if (currentUser.isAnonymous) {
        dispatch(openSignInRequiredDialog());
        return;
      }
      dispatch(openCreateMapDialog());
    },

    handleCreateReviewButtonClick: (currentUser) => {
      if (currentUser.isAnonymous) {
        dispatch(openSignInRequiredDialog());
        return;
      }
      dispatch(openPlaceSelectDialog());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NoContents);
