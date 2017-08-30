import { connect } from 'react-redux';
import Home from '../ui/Home';
import updatePageTitle from '../actions/updatePageTitle';

const mapStateToProps = (state) => {
  return {
    large: state.shared.large
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updatePageTitle: () => {
      dispatch(updatePageTitle('Home'));
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
