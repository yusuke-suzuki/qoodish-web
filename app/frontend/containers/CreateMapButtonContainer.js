import { connect } from 'react-redux';
import CreateMapButton from '../ui/CreateMapButton';
import openCreateMapDialog from '../actions/openCreateMapDialog';
import openSignInRequiredDialog from '../actions/openSignInRequiredDialog';

const mapStateToProps = state => {
  return {
    large: state.shared.large,
    currentUser: state.app.currentUser
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleButtonClick: (currentUser) => {
      if (currentUser.isAnonymous) {
        dispatch(openSignInRequiredDialog());
        return;
      }
      dispatch(openCreateMapDialog());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateMapButton);
