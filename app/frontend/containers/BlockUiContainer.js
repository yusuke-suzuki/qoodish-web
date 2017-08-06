import { connect } from 'react-redux';
import BlockUi from '../ui/BlockUi.jsx';

const mapStateToProps = (state) => {
  return {
    blocking: state.shared.blocking
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BlockUi);
