import React, { useCallback, useContext, useEffect } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';

import openSpotCard from '../../actions/openSpotCard';
import closeSpotCard from '../../actions/closeSpotCard';
import fetchMapSpotReviews from '../../actions/fetchMapSpotReviews';
import SpotCardContent from '../molecules/SpotCardContent';
import AuthContext from '../../context/AuthContext';
import { createStyles, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() =>
  createStyles({
    modal: {
      height: 0
    }
  })
);

const MapSpotDrawer = () => {
  const dispatch = useDispatch();
  const { currentUser } = useContext(AuthContext);

  const mapState = useCallback(
    state => ({
      open: state.spotCard.spotCardOpen,
      currentSpot: state.spotCard.currentSpot,
      reviewDialogOpen: state.reviews.reviewDialogOpen,
      spotDialogOpen: state.spotDetail.spotDialogOpen,
      mapSummaryOpen: state.mapDetail.mapSummaryOpen,
      spotReviews: state.spotCard.spotReviews
    }),
    []
  );
  const {
    open,
    currentSpot,
    reviewDialogOpen,
    spotDialogOpen,
    mapSummaryOpen,
    spotReviews
  } = useMappedState(mapState);

  const handleOpen = useCallback(() => {
    dispatch(openSpotCard());
  }, [dispatch]);

  const handleClose = useCallback(() => {
    dispatch(closeSpotCard());
  }, [dispatch]);

  const initSpotReviews = useCallback(async () => {
    const opts = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await currentUser.getIdToken()}`
      }
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/maps/${currentSpot.map_id}/spots/${currentSpot.place_id}/reviews`,
      opts
    );

    if (response.ok) {
      const json = await response.json();
      dispatch(fetchMapSpotReviews(json));
    }
  }, [dispatch, currentSpot, currentUser]);

  useEffect(() => {
    if (currentSpot.place_id) {
      initSpotReviews();
    }
  }, [currentSpot.place_id]);

  useEffect(() => {
    if (spotReviews.length < 1) {
      handleClose();
    }
  }, [spotReviews]);

  const dialogOpen = reviewDialogOpen || spotDialogOpen || mapSummaryOpen;

  const classes = useStyles();

  return (
    <SwipeableDrawer
      variant="temporary"
      anchor="bottom"
      open={open && !dialogOpen}
      PaperProps={{
        square: false
      }}
      onOpen={handleOpen}
      onClose={handleClose}
      disableSwipeToOpen
      ModalProps={{
        className: classes.modal,
        BackdropProps: {
          invisible: true,
          open: false
        }
      }}
      disableBackdropTransition
    >
      <SpotCardContent />
    </SwipeableDrawer>
  );
};

export default React.memo(MapSpotDrawer);
