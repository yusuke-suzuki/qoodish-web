import { connect } from 'react-redux';
import Privacy from '../ui/Privacy';
import { push, goBack } from 'react-router-redux';

const mapStateToProps = state => {
  return {
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleLogoClick: () => {
      dispatch(push('/'));
    },

    handleBackButtonClick: () => {
      dispatch(goBack());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Privacy);
