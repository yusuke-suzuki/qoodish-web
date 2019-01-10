import React from 'react';
import { connect } from 'react-redux';
import LikesDialog from '../ui/LikesDialog';
import closeLikesDialog from '../actions/closeLikesDialog';

const mapStateToProps = state => {
  return {
    dialogOpen: state.shared.likesDialogOpen,
    likes: state.shared.likes
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleRequestDialogClose: () => {
      dispatch(closeLikesDialog());
    }
  };
};

export default React.memo(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(LikesDialog)
);
