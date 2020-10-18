import React, { useCallback, useContext, useEffect, useState } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Link from 'next/link';

import Typography from '@material-ui/core/Typography';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import { ApiClient, MapsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core';
import AuthContext from '../../context/AuthContext';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    gridList: {
      width: '100%',
      borderRadius: 4
    },
    pickUpTile: {
      height: 280,
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        height: 330
      }
    },
    pickUpTileBar: {
      height: '100%'
    },
    pickUpText: {
      whiteSpace: 'normal',
      wordWrap: 'break-word'
    }
  })
);

const PickUpMap = () => {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const [map, setMap] = useState(undefined);

  const { currentUser } = useContext(AuthContext);

  const classes = useStyles();

  const initPickUpMap = useCallback(async () => {
    const apiInstance = new MapsApi();
    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';

    apiInstance.mapsMapIdGet(
      process.env.NEXT_PUBLIC_PICKED_UP_MAP_ID,
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
    <GridList cols={1} className={classes.gridList} spacing={0}>
      <Link href={`/maps/${map && map.id}`}>
        <a title={map && map.name}>
          <GridListTile className={classes.pickUpTile}>
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
                  className={classes.pickUpText}
                >
                  {map && map.name}
                </Typography>
              }
              subtitle={
                <Typography
                  variant={smUp ? 'h4' : 'h5'}
                  color="inherit"
                  className={classes.pickUpText}
                >
                  <span>{map && `by: ${map.owner_name}`}</span>
                </Typography>
              }
              className={classes.pickUpTileBar}
            />
          </GridListTile>
        </a>
      </Link>
    </GridList>
  );
};

export default React.memo(PickUpMap);
