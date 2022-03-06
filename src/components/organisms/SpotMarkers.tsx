import React, { useEffect, useCallback, useState } from 'react';
import { SpotsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import { useDispatch, useMappedState } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import fetchSpots from '../../actions/fetchSpots';
import selectMapSpot from '../../actions/selectMapSpot';
import openSpotCard from '../../actions/openSpotCard';
import clearMapSpotState from '../../actions/clearMapSpotState';
import { Popover, useTheme } from '@material-ui/core';
import SpotInfoWindow from '../molecules/SpotInfoWindow';
import SpotMarker from '../molecules/SpotMarker';

const SpotMarkers = () => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(undefined);
  const [windowOpen, setWindowOpen] = useState(false);
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const mapState = useCallback(
    state => ({
      spots: state.gMap.spots,
      mapReviews: state.mapSummary.mapReviews,
      currentMap: state.mapSummary.currentMap
    }),
    []
  );
  const { spots, mapReviews, currentMap } = useMappedState(mapState);

  const onSpotMarkerClick = useCallback(
    async (e, spot) => {
      dispatch(selectMapSpot(spot));

      if (mdUp) {
        setAnchorEl(e.currentTarget);
        setWindowOpen(true);
      } else {
        dispatch(openSpotCard());
      }
    },
    [dispatch, mdUp]
  );

  const handlePopoverClose = useCallback(() => {
    setWindowOpen(false);
  }, []);

  const clearSpot = useCallback(() => {
    dispatch(clearMapSpotState());
  }, [dispatch]);

  const refreshSpots = useCallback(async () => {
    setAnchorEl(undefined);
    setWindowOpen(false);

    const apiInstance = new SpotsApi();

    apiInstance.mapsMapIdSpotsGet(currentMap.id, (error, data, response) => {
      if (response.ok) {
        dispatch(fetchSpots(response.body));
      }
    });
  }, [dispatch, currentMap]);

  useEffect(() => {
    if (currentMap) {
      refreshSpots();
    }
  }, [mapReviews, currentMap]);

  return (
    <React.Fragment>
      <Popover
        id="spot-info-window"
        anchorEl={anchorEl}
        open={windowOpen}
        onClose={handlePopoverClose}
        onExited={clearSpot}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
      >
        <SpotInfoWindow />
      </Popover>

      {spots.map(spot => (
        <SpotMarker
          key={spot.id}
          spot={spot}
          onClick={e => onSpotMarkerClick(e, spot)}
          large={mdUp}
          aria-label="Info window"
          aria-owns={windowOpen ? 'spot-info-window' : null}
          aria-haspopup="true"
        />
      ))}
    </React.Fragment>
  );
};

export default React.memo(SpotMarkers);
