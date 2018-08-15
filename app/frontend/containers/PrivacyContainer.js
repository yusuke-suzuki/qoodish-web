import { connect } from 'react-redux';
import Privacy from '../ui/Privacy';
import updatePageTitle from '../actions/updatePageTitle';

const mapStateToProps = state => {
  return {
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updatePageTitle: (title) => {
      dispatch(updatePageTitle(title));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Privacy);
