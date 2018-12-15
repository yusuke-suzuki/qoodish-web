import React from 'react';
import { connect } from 'react-redux';
import CreateActions from '../ui/CreateActions';
import openCreateMapDialog from '../actions/openCreateMapDialog';
import selectPlaceForReview from '../actions/selectPlaceForReview';
import openPlaceSelectDialog from '../actions/openPlaceSelectDialog';
import closeCreateActions from '../actions/closeCreateActions';

const mapStateToProps = state => {
  return {
    open: state.shared.createActionsOpen,
    large: state.shared.large,
    currentSpot: state.spotDetail.currentSpot
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleCloseDrawer: () => {
      dispatch(closeCreateActions());
    },

    handleCreateMapButtonClick: () => {
      dispatch(openCreateMapDialog());
      dispatch(closeCreateActions());
    },

    handleCreateReviewButtonClick: (spot) => {
      if (spot) {
        let place = {
          description: spot.name,
          placeId: spot.place_id
        };
        dispatch(selectPlaceForReview(place));
      } else {
        dispatch(openPlaceSelectDialog());
      }
      dispatch(closeCreateActions());
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(CreateActions));
