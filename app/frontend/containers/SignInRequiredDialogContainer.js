import { connect } from 'react-redux';
import SignInRequiredDialog from '../ui/SignInRequiredDialog';
import closeSignInRequiredDialog from '../actions/closeSignInRequiredDialog';

const mapStateToProps = state => {
  return {
    dialogOpen: state.shared.signInRequiredDialogOpen
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onClose: () => {
      dispatch(closeSignInRequiredDialog());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SignInRequiredDialog);
