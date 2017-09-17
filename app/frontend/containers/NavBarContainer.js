import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import NavBar from '../ui/NavBar';
import signOut from '../actions/signOut';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import openToast from '../actions/openToast';
import firebase from 'firebase';

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
    signOut: async () => {
      dispatch(requestStart());
      await firebase.auth().signOut();
      dispatch(requestFinish());
      dispatch(signOut());
    },

    requestHome: () => {
      dispatch(push('/'));
    },

    requestTimeline: () => {
      dispatch(push('/timeline'));
    },

    requestMaps: () => {
      dispatch(push('/maps'));
    },

    requestSettings: () => {
      dispatch(push('/settings'));
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavBar);
