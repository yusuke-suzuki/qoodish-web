import React, { useEffect, useCallback, useState, useContext } from 'react';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { ApiClient, MapsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import I18n from '../../utils/I18n';

import { Link } from '@yusuke-suzuki/rize-router';
import MapCard from '../molecules/MapCard';
import SkeletonMapCard from '../molecules/SkeletonMapCard';
import AuthContext from '../../context/AuthContext';

const styles = {
  titleContainer: {
    display: 'inline-flex',
    alignItems: 'baseline',
    marginBottom: 15,
    width: '100%'
  },
  mapCard: {
    marginBottom: 20
  },
  discoverButton: {
    marginLeft: 'auto'
  }
};

const RecommendMaps = () => {
  const [maps, setMaps] = useState([]);
  const { currentUser } = useContext(AuthContext);

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
    <div>
      <div>
        <div style={styles.titleContainer}>
          <Typography variant="subtitle1" color="textSecondary">
            {I18n.t('recommend')}
          </Typography>
          <Button
            component={Link}
            to="/discover"
            size="small"
            color="primary"
            style={styles.discoverButton}
          >
            {I18n.t('discover more')}
          </Button>
        </div>
        {maps.length < 1 ? (
          <Loading />
        ) : (
          maps.map(map => (
            <div key={map.id} style={styles.mapCard}>
              <MapCard map={map} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Loading = React.memo(() => {
  return (
    <div>
      {Array.from(new Array(2)).map((v, i) => (
        <div key={i} style={styles.mapCard}>
          <SkeletonMapCard elevation={0} />
        </div>
      ))}
    </div>
  );
});

export default React.memo(RecommendMaps);
