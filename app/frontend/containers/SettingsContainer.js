import { connect } from 'react-redux';
import Settings from '../ui/Settings';
import openDeleteAccountDialog from '../actions/openDeleteAccountDialog';

const mapStateToProps = (state) => {
  return {
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleDeleteAccountButtonClick: () => {
      dispatch(openDeleteAccountDialog());
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
