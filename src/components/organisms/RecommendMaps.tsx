import React, { useEffect, useCallback, useState, useContext } from 'react';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { ApiClient, MapsApi } from '@yusuke-suzuki/qoodish-api-js-client';

import Link from 'next/link';
import MapCard from '../molecules/MapCard';
import SkeletonMapCard from '../molecules/SkeletonMapCard';
import AuthContext from '../../context/AuthContext';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    titleContainer: {
      display: 'inline-flex',
      alignItems: 'baseline',
      marginBottom: theme.spacing(2),
      width: '100%'
    },
    mapCard: {
      marginBottom: 20
    },
    discoverButton: {
      marginLeft: 'auto'
    }
  })
);

const RecommendMaps = () => {
  const [maps, setMaps] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const classes = useStyles();
  const { I18n } = useLocale();

  const refreshMaps = useCallback(async () => {
    const apiInstance = new MapsApi();
    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';

    apiInstance.mapsGet({ recommend: true }, (error, data, response) => {
      if (response.ok) {
        setMaps(response.body.slice(0, 2));
      }
    });
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      return;
    }
    refreshMaps();
  }, [currentUser]);

  return (
    <>
      <div className={classes.titleContainer}>
        <Typography variant="subtitle1" color="textSecondary">
          {I18n.t('recommend')}
        </Typography>
        <Link href="/discover" passHref>
          <Button
            size="small"
            color="primary"
            className={classes.discoverButton}
          >
            {I18n.t('discover more')}
          </Button>
        </Link>
      </div>
      {maps.length < 1 ? (
        <Loading />
      ) : (
        maps.map(map => (
          <div key={map.id} className={classes.mapCard}>
            <MapCard map={map} />
          </div>
        ))
      )}
    </>
  );
};

const Loading = React.memo(() => {
  const classes = useStyles();

  return (
    <>
      {Array.from(new Array(2)).map((v, i) => (
        <div key={i} className={classes.mapCard}>
          <SkeletonMapCard />
        </div>
      ))}
    </>
  );
});

export default React.memo(RecommendMaps);
