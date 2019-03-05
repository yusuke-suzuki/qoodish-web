import React, { useEffect, useCallback, useState } from 'react';

import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';

import initializeApiClient from '../../utils/initializeApiClient';
import { MapsApi } from 'qoodish_api';
import I18n from '../../utils/I18n';

import Link from '../molecules/Link';
import MapCard from '../molecules/MapCard';
import SkeltonMapCard from '../molecules/SkeltonMapCard';

const styles = {
  container: {
    padding: 16,
    paddingBottom: 120
  },
  recommendTitle: {
    marginBottom: 15
  },
  divider: {
    marginBottom: 24
  }
};

const RecommendMaps = () => {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshMaps = useCallback(async () => {
    setLoading(true);
    await initializeApiClient();
    const apiInstance = new MapsApi();

    apiInstance.mapsGet({ recommend: true }, (error, data, response) => {
      setLoading(false);
      if (response.ok) {
        setMaps(response.body.slice(0, 2));
      }
    });
  });

  useEffect(() => {
    refreshMaps();
  }, []);

  return (
    <div style={styles.container}>
      <Typography
        variant="subtitle1"
        style={styles.recommendTitle}
        color="textSecondary"
      >
        {I18n.t('recommend')}
      </Typography>
      {loading ? (
        <Loading />
      ) : (
        maps.map(map => (
          <div key={map.id}>
            <MapCard map={map} />
            <Divider style={styles.divider} />
          </div>
        ))
      )}
      <Button component={Link} to="/discover" size="small">
        {I18n.t('discover maps')} →
      </Button>
    </div>
  );
};

const Loading = React.memo(() => {
  return (
    <div>
      {Array.from(new Array(2)).map((v, i) => (
        <div key={i}>
          <SkeltonMapCard />
          <Divider style={styles.divider} />
        </div>
      ))}
    </div>
  );
});

export default React.memo(RecommendMaps);
