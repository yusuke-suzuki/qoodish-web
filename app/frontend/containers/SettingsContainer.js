import { connect } from 'react-redux';
import Settings from '../ui/Settings';
import openDeleteAccountDialog from '../actions/openDeleteAccountDialog';
import updatePageTitle from '../actions/updatePageTitle';

const mapStateToProps = (state) => {
  return {
    large: state.shared.large
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updatePageTitle: () => {
      dispatch(updatePageTitle('Settings'));
    },

    handleDeleteAccountButtonClick: () => {
      dispatch(openDeleteAccountDialog());
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
