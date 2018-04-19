import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import NoContents from '../ui/NoContents';
import openCreateMapDialog from '../actions/openCreateMapDialog';
import openPlaceSelectDialog from '../actions/openPlaceSelectDialog';

const mapStateToProps = state => {
  return {
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleCreateMapButtonClick: () => {
      dispatch(openCreateMapDialog());
    },

    handleCreateReviewButtonClick: () => {
      dispatch(openPlaceSelectDialog());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NoContents);
