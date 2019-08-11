import React, { useCallback, useEffect, useState } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Link from '../molecules/Link';

import Typography from '@material-ui/core/Typography';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import { MapsApi } from 'qoodish_api';
import { useMappedState } from 'redux-react-hook';

const styles = {
  gridList: {
    width: '100%',
    borderRadius: 4
  },
  pickUpTileLarge: {
    height: 330
  },
  pickUpTileSmall: {
    height: 280
  },
  pickUpTileBar: {
    height: '100%'
  },
  pickUpText: {
    whiteSpace: 'normal',
    wordWrap: 'break-word'
  }
};

const PickUpMap = () => {
  const large = useMediaQuery('(min-width: 600px)');
  const [map, setMap] = useState(undefined);

  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser
    }),
    []
  );
  const { currentUser } = useMappedState(mapState);

  const initPickUpMap = useCallback(async () => {
    const apiInstance = new MapsApi();

    apiInstance.mapsMapIdGet(
      process.env.PICKED_UP_MAP_ID,
      (error, data, response) => {
        if (response.ok) {
          setMap(response.body);
        }
      }
    );
  });

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      return;
    }
    initPickUpMap();
  }, [currentUser.uid]);

  return (
    <GridList cols={1} style={styles.gridList} spacing={0}>
      <GridListTile
        key={map && map.id}
        style={large ? styles.pickUpTileLarge : styles.pickUpTileSmall}
        component={Link}
        to={`/maps/${map && map.id}`}
        title={map && map.name}
      >
        <img loading="lazy" src={map && map.image_url} alt={map && map.name} />
        <GridListTileBar
          title={
            <Typography
              variant={large ? 'h2' : 'h4'}
              color="inherit"
              gutterBottom
              style={styles.pickUpText}
            >
              {map && map.name}
            </Typography>
          }
          subtitle={
            <Typography
              variant={large ? 'h4' : 'h5'}
              color="inherit"
              style={styles.pickUpText}
            >
              <span>{map && `by: ${map.owner_name}`}</span>
            </Typography>
          }
          style={styles.pickUpTileBar}
        />
      </GridListTile>
    </GridList>
  );
};

export default React.memo(PickUpMap);
