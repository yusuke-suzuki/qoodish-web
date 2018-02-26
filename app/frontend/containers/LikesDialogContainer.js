import { connect } from 'react-redux';
import LikesDialog from '../ui/LikesDialog';
import closeLikesDialog from '../actions/closeLikesDialog';

const mapStateToProps = state => {
  return {
    dialogOpen: state.shared.likesDialogOpen,
    likes: state.shared.likes
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleRequestDialogClose: () => {
      dispatch(closeLikesDialog());
    },

    handleLikeClick: like => {}
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LikesDialog);
