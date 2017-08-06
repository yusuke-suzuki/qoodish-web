import { connect } from 'react-redux';
import Dashboard from '../ui/Dashboard';
import ApiClient from '../containers/ApiClient';
import openToast from '../actions/openToast';
import updatePageTitle from '../actions/updatePageTitle';
import signOut from '../actions/signOut';
import { push } from 'react-router-redux';

const mapStateToProps = (state) => {
  return {
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updatePageTitle: () => {
      dispatch(updatePageTitle('Dashboard'));
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
