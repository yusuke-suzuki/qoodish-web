import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';

import openSpotCard from '../../actions/openSpotCard';
import closeSpotCard from '../../actions/closeSpotCard';
import ReviewsApi from '@yusuke-suzuki/qoodish-api-js-client/dist/api/ReviewsApi';
import fetchMapSpotReviews from '../../actions/fetchMapSpotReviews';
import SpotCardContent from '../molecules/SpotCardContent';
import { useIOS } from '../../utils/detectDevice';

const styles = {
  modal: {
    height: 0
  }
};

const MapSpotDrawer = () => {
  const dispatch = useDispatch();

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
    const apiInstance = new ReviewsApi();

    apiInstance.mapsMapIdSpotsPlaceIdReviewsGet(
      currentSpot.map_id,
      currentSpot.place_id,
      (error, data, response) => {
        if (response.ok) {
          dispatch(fetchMapSpotReviews(response.body));
        }
      }
    );
  }, [dispatch, currentSpot]);

  const iOS = useMemo(() => {
    return useIOS();
  }, [useIOS]);

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
        style: styles.modal,
        BackdropProps: {
          invisible: true,
          open: false
        }
      }}
      disableBackdropTransition
      disableDiscovery={iOS}
    >
      <SpotCardContent />
    </SwipeableDrawer>
  );
};

export default React.memo(MapSpotDrawer);
