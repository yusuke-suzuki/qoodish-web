import React, { useCallback } from 'react';
import SharedPlaceSelectDialog from './SharedPlaceSelectDialog';
import { useMappedState, useDispatch } from 'redux-react-hook';

import closeBaseSelectDialog from '../../actions/closeBaseSelectDialog';
import selectMapBase from '../../actions/selectMapBase';

const BaseSelectDialog = () => {
  const dispatch = useDispatch();

  const dialogOpen = useMappedState(
    useCallback(state => state.maps.baseSelectDialogOpen, [])
  );

  const onClose = useCallback(() => {
    dispatch(closeBaseSelectDialog());
  }, [dispatch]);

  const onPlaceSelected = useCallback(
    place => {
      dispatch(selectMapBase(place));
    },
    [dispatch]
  );

  return (
    <SharedPlaceSelectDialog
      dialogOpen={dialogOpen}
      onClose={onClose}
      onPlaceSelected={onPlaceSelected}
    />
  );
};

export default React.memo(BaseSelectDialog);
