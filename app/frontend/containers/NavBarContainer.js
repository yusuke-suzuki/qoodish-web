import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import NavBar from '../ui/NavBar.jsx';
import signOut from '../actions/signOut.js';
import requestStart from '../actions/requestStart.js';
import requestFinish from '../actions/requestFinish.js';
import openToast from '../actions/openToast.js';

const mapStateToProps = (state) => {
  return {
    authenticated: state.app.authenticated,
    currentUser: state.app.currentUser,
    large: state.shared.large,
    pageTitle: state.shared.pageTitle
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    signOut: () => {
      dispatch(signOut());
      dispatch(openToast('Signed out successfully!'));
    },

    requestHome: () => {
      dispatch(push('/'));
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavBar);
