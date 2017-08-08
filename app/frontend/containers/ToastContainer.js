import { connect } from 'react-redux';
import Toast from '../ui/Toast';
import closeToast from '../actions/closeToast';

const mapStateToProps = (state) => {
  return {
    toastOpen: state.shared.toastOpen,
    toastMessage: state.shared.toastMessage
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleRequestClose: () => {
      dispatch(closeToast());
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Toast);
