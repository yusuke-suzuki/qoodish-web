import React, { useCallback } from 'react';
import SharedPlaceSelectDialog from './SharedPlaceSelectDialog';
import { useMappedState, useDispatch } from 'redux-react-hook';

import ApiClient from '../../utils/ApiClient';
import closePlaceSelectDialog from '../../actions/closePlaceSelectDialog';
import selectPlaceForReview from '../../actions/selectPlaceForReview';
import searchPlaces from '../../actions/searchPlaces';
import fetchCurrentPosition from '../../utils/fetchCurrentPosition';
import getCurrentPosition from '../../actions/getCurrentPosition';

const PlaceSelectDialog = () => {
  const dispatch = useDispatch();

  const dialogOpen = useMappedState(
    useCallback(state => state.mapDetail.placeSelectDialogOpen, [])
  );

  const onClose = useCallback(() => {
    dispatch(closePlaceSelectDialog());
  });

  const onPlaceSelected = useCallback(place => {
    dispatch(selectPlaceForReview(place));
  });

  const onEnter = useCallback(async () => {
    const position = await fetchCurrentPosition();
    dispatch(
      getCurrentPosition(position.coords.latitude, position.coords.longitude)
    );
    const client = new ApiClient();
    let response = await client.searchNearPlaces(
      position.coords.latitude,
      position.coords.longitude
    );
    let places = await response.json();
    if (response.ok) {
      dispatch(searchPlaces(places));
    }
  });

  return (
    <SharedPlaceSelectDialog
      dialogOpen={dialogOpen}
      onEnter={onEnter}
      onClose={onClose}
      onPlaceSelected={onPlaceSelected}
    />
  );
};

export default React.memo(PlaceSelectDialog);
