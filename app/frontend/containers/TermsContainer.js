import { connect } from 'react-redux';
import Terms from '../ui/Terms';
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

export default connect(mapStateToProps, mapDispatchToProps)(Terms);
