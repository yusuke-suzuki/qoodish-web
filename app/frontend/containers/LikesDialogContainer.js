import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import LikesDialog from '../ui/LikesDialog';
import closeLikesDialog from '../actions/closeLikesDialog';

const mapStateToProps = state => {
  return {
    dialogOpen: state.shared.likesDialogOpen,
    likes: state.shared.likes
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleRequestDialogClose: () => {
      dispatch(closeLikesDialog());
    },

    handleLikeClick: like => {
      dispatch(push(`/users/${like.voter.id}`, {
        previous: true
      }));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LikesDialog);
