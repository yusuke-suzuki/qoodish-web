import React, { useEffect, useCallback, useState } from 'react';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

import initializeApiClient from '../../utils/initializeApiClient';
import { MapsApi } from 'qoodish_api';
import Link from '../molecules/Link';
import CardMedia from '@material-ui/core/CardMedia';
import FollowMapButton from '../molecules/FollowMapButton';
import Divider from '@material-ui/core/Divider';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import ButtonBase from '@material-ui/core/ButtonBase';
import I18n from '../../utils/I18n';

const styles = {
  container: {
    padding: 16
  },
  recommendTitle: {
    marginBottom: 15
  },
  gridList: {},
  mapImage: {
    width: '100%',
    height: 120,
    objectFit: 'cover'
  },
  cardContent: {
    padding: 0,
    marginBottom: 24
  },
  divider: {
    marginBottom: 24
  },
  skeltonTextPrimary: {
    width: '100%',
    height: '1rem'
  },
  skeltonTextSecondary: {
    width: '50%',
    height: '0.875rem'
  },
  loadingButton: {
    color: 'rgba(0, 0, 0, 0)'
  },
  loadingImage: {
    background: 'rgba(0, 0, 0, 0.1)'
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
        setMaps(response.body);
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
          <div>
            <CardContent style={styles.cardContent} key={map.id}>
              <ButtonBase
                component={Link}
                to={`/maps/${map.id}`}
                title={map.name}
              >
                <CardMedia>
                  <img
                    src={map.image_url}
                    alt={map.name}
                    style={styles.mapImage}
                  />
                </CardMedia>
              </ButtonBase>
              <Typography variant="subtitle1" noWrap>
                {map.name}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary" noWrap>
                {map.owner_name}
              </Typography>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
                noWrap
              >
                {map.description}
              </Typography>
              <FollowMapButton currentMap={map} />
            </CardContent>
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
      {Array.from(new Array(5)).map((v, i) => (
        <div>
          <CardContent style={styles.cardContent} key={i}>
            <CardMedia
              style={Object.assign({}, styles.mapImage, styles.loadingImage)}
            />
            <Typography variant="subtitle1">
              <Chip style={styles.skeltonTextPrimary} />
            </Typography>
            <Typography variant="subtitle2">
              <Chip style={styles.skeltonTextSecondary} />
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              <Chip style={styles.skeltonTextSecondary} />
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              disabled
              style={styles.loadingButton}
            >
              Loading
            </Button>
          </CardContent>
          <Divider style={styles.divider} />
        </div>
      ))}
    </div>
  );
});

export default React.memo(RecommendMaps);
