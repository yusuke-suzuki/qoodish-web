import React, { useEffect, useCallback, useState } from 'react';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { MapsApi } from 'qoodish_api';
import I18n from '../../utils/I18n';

import { Link } from '@yusuke-suzuki/rize-router';
import MapCard from '../molecules/MapCard';
import SkeltonMapCard from '../molecules/SkeltonMapCard';
import { useMappedState } from 'redux-react-hook';

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
  const [loading, setLoading] = useState(true);

  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser
    }),
    []
  );

  const { currentUser } = useMappedState(mapState);

  const refreshMaps = useCallback(async () => {
    setLoading(true);
    const apiInstance = new MapsApi();

    apiInstance.mapsGet({ recommend: true }, (error, data, response) => {
      setLoading(false);
      if (response.ok) {
        setMaps(response.body.slice(0, 2));
      }
    });
  });

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      return;
    }
    refreshMaps();
  }, [currentUser.uid]);

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
        {loading ? (
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
          <SkeltonMapCard elevation={0} />
        </div>
      ))}
    </div>
  );
});

export default React.memo(RecommendMaps);
