import React, { useCallback, useContext, useEffect, useState } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import { Link } from '@yusuke-suzuki/rize-router';

import Typography from '@material-ui/core/Typography';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import { ApiClient, MapsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import { useTheme } from '@material-ui/core';
import AuthContext from '../../context/AuthContext';

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
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const [map, setMap] = useState(undefined);

  const { currentUser } = useContext(AuthContext);

  const initPickUpMap = useCallback(async () => {
    const apiInstance = new MapsApi();
    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';

    apiInstance.mapsMapIdGet(
      process.env.PICKED_UP_MAP_ID,
      (error, data, response) => {
        if (response.ok) {
          setMap(response.body);
        }
      }
    );
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      return;
    }
    initPickUpMap();
  }, [currentUser]);

  return (
    <GridList cols={1} style={styles.gridList} spacing={0}>
      <GridListTile
        key={map && map.id}
        style={smUp ? styles.pickUpTileLarge : styles.pickUpTileSmall}
        component={Link}
        to={`/maps/${map && map.id}`}
        title={map && map.name}
      >
        <img
          src={map && map.thumbnail_url_800}
          alt={map && map.name}
          loading="lazy"
        />
        <GridListTileBar
          title={
            <Typography
              variant={smUp ? 'h2' : 'h4'}
              color="inherit"
              gutterBottom
              style={styles.pickUpText}
            >
              {map && map.name}
            </Typography>
          }
          subtitle={
            <Typography
              variant={smUp ? 'h4' : 'h5'}
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
