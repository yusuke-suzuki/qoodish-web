import React, { useCallback } from 'react';
import { useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Tooltip from '@material-ui/core/Tooltip';
import Fab from '@material-ui/core/Fab';
import MyLocationIcon from '@material-ui/icons/MyLocation';

import fetchCurrentPosition from '../../utils/fetchCurrentPosition';
import getCurrentPosition from '../../actions/getCurrentPosition';
import requestCurrentPosition from '../../actions/requestCurrentPosition';

import I18n from '../../utils/I18n';

const styles = {
  buttonLarge: {
    zIndex: 1100,
    position: 'absolute',
    bottom: 108,
    right: 32,
    backgroundColor: 'white'
  },
  buttonSmall: {
    zIndex: 1100,
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: 'white'
  }
};

const LocationButton = () => {
  const dispatch = useDispatch();
  const large = useMediaQuery('(min-width: 600px)');

  const handleButtonClick = useCallback(async () => {
    const position = await fetchCurrentPosition();

    dispatch(
      getCurrentPosition(position.coords.latitude, position.coords.longitude)
    );

    dispatch(requestCurrentPosition());
  }, [dispatch]);

  return (
    <Tooltip title={I18n.t('button current location')}>
      <Fab
        style={large ? styles.buttonLarge : styles.buttonSmall}
        onClick={handleButtonClick}
      >
        <MyLocationIcon />
      </Fab>
    </Tooltip>
  );
};

export default React.memo(LocationButton);
