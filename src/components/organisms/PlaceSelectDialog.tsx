import React, { useCallback } from 'react';
import SharedPlaceSelectDialog from './SharedPlaceSelectDialog';
import { useMappedState, useDispatch } from 'redux-react-hook';

import closePlaceSelectDialog from '../../actions/closePlaceSelectDialog';
import selectPlaceForReview from '../../actions/selectPlaceForReview';
import searchPlaces from '../../actions/searchPlaces';
import fetchCurrentPosition from '../../utils/fetchCurrentPosition';
import getCurrentPosition from '../../actions/getCurrentPosition';
import { PlacesApi } from '@yusuke-suzuki/qoodish-api-js-client';

const PlaceSelectDialog = () => {
  const dispatch = useDispatch();

  const dialogOpen = useMappedState(
    useCallback(state => state.mapDetail.placeSelectDialogOpen, [])
  );

  const onClose = useCallback(() => {
    dispatch(closePlaceSelectDialog());
  }, [dispatch]);

  const onPlaceSelected = useCallback(
    place => {
      dispatch(selectPlaceForReview(place));
    },
    [dispatch]
  );

  const onEntered = useCallback(async () => {
    const position = await fetchCurrentPosition();
    dispatch(
      getCurrentPosition(position.coords.latitude, position.coords.longitude)
    );

    const apiInstance = new PlacesApi();
    const opts = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    apiInstance.placesGet(opts, (error, data, response) => {
      if (response.ok) {
        dispatch(searchPlaces(response.body));
      } else {
        console.log('API called successfully. Returned data: ' + data);
      }
    });
  }, [dispatch]);

  return (
    <SharedPlaceSelectDialog
      dialogOpen={dialogOpen}
      onEntered={onEntered}
      onClose={onClose}
      onPlaceSelected={onPlaceSelected}
    />
  );
};

export default React.memo(PlaceSelectDialog);
