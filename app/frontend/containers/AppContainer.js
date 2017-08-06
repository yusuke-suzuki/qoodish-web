import { connect } from 'react-redux';
import App from '../ui/App.jsx';
import updateWindowSize from '../actions/updateWindowSize.js';

const mapStateToProps = (state) => {
  return {
    authenticated: state.app.authenticated,
    large: state.shared.large
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleWindowSizeChange: (width) => {
      dispatch(updateWindowSize(width));
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
