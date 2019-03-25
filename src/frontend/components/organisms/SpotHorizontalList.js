import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import {
  GridList,
  GridListTile,
  GridListTileBar,
  Typography
} from '@material-ui/core';
import selectSpot from '../../actions/selectSpot';
import openSpotCard from '../../actions/openSpotCard';
import requestMapCenter from '../../actions/requestMapCenter';

const styles = {
  root: {
    position: 'absolute',
    bottom: 0,
    padding: 12,
    background: 'rgba(0, 0, 0, 0.1)'
  },
  gridList: {
    flexWrap: 'nowrap',
    transform: 'translateZ(0)'
  }
};

const SpotHorizontalList = () => {
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      spots: state.gMap.spots
    }),
    []
  );

  const { spots } = useMappedState(mapState);

  const handleSpotClick = useCallback(spot => {
    dispatch(selectSpot(spot));
    dispatch(openSpotCard());
    dispatch(requestMapCenter(spot.lat, spot.lng));
  });

  return (
    <div style={styles.root}>
      <GridList cols={2.5} cellHeight={100} style={styles.gridList}>
        {spots.map(spot => (
          <GridListTile
            key={spot.place_id}
            onClick={() => handleSpotClick(spot)}
          >
            <img src={spot.image_url} alt={spot.name} />
            <GridListTileBar
              title={
                <Typography variant="subtitle2" color="inherit" noWrap>
                  {spot.name}
                </Typography>
              }
            />
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
};

export default React.memo(SpotHorizontalList);
