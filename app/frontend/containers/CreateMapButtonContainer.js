import { connect } from 'react-redux';
import CreateMapButton from '../ui/CreateMapButton';
import openCreateMapDialog from '../actions/openCreateMapDialog';

const mapStateToProps = state => {
  return {
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
  return {

    handleButtonClick: () => {
      dispatch(openCreateMapDialog());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateMapButton);
