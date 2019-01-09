import React from 'react';
import { connect } from 'react-redux';
import FollowingMapsDialog from '../ui/FollowingMapsDialog';
import closeFollowingMapsDialog from '../actions/closeFollowingMapsDialog';

const mapStateToProps = state => {
  return {
    open: state.profile.followingMapsDialogOpen,
    maps: state.profile.followingMaps,
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onClose: () => {
      dispatch(closeFollowingMapsDialog());
    }
  };
};

export default React.memo(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(FollowingMapsDialog)
);
