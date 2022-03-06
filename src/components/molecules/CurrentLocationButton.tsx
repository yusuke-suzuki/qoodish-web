import { memo, useCallback, useContext, useState } from 'react';
import {
  CircularProgress,
  createStyles,
  Fab,
  makeStyles
} from '@material-ui/core';
import { MyLocation } from '@material-ui/icons';
import fetchCurrentPosition from '../../utils/fetchCurrentPosition';
import GoogleMapsContext from '../../context/GoogleMapsContext';

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      position: 'relative'
    },
    fab: {
      backgroundColor: theme.palette.background.paper
    },
    fabProgress: {
      color: theme.palette.primary.main,
      position: 'absolute',
      top: -6,
      left: -6,
      zIndex: 1
    }
  })
);

export default memo(function CurrentLocationButton() {
  const { googleMap } = useContext(GoogleMapsContext);

  const [loading, setLoading] = useState<boolean>(false);

  const handleClick = useCallback(async () => {
    setLoading(true);

    const position = await fetchCurrentPosition();

    googleMap.setCenter({
      lat: position.coords.latitude,
      lng: position.coords.longitude
    });
    googleMap.setZoom(17);

    setLoading(false);
  }, [googleMap, fetchCurrentPosition]);

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Fab onClick={handleClick} className={classes.fab} disabled={loading}>
        <MyLocation color="primary" />
      </Fab>
      {loading && (
        <CircularProgress size={68} className={classes.fabProgress} />
      )}
    </div>
  );
});
