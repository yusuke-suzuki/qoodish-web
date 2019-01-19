import React, { useCallback, useEffect, useState } from 'react';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import { Link } from 'react-router-dom';

import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Button from '@material-ui/core/Button';

import ApiClient from '../../utils/ApiClient';
import I18n from '../../utils/I18n';

const styles = {
  progress: {
    textAlign: 'center',
    padding: 10,
    marginTop: 20
  },
  listItemLarge: {
    paddingLeft: 10,
    paddingRight: 64
  },
  listItemSmall: {
    paddingLeft: 10,
    paddingRight: 64
  },
  listItemSecondaryAction: {
    right: 10
  }
};

const TrendingSpots = () => {
  const large = useMediaQuery('(min-width: 600px)');
  const [loading, setLoading] = useState(false);
  const [spots, setSpots] = useState([]);

  const initTrendingSpots = useCallback(async () => {
    setLoading(true);
    const client = new ApiClient();
    let response = await client.fetchTrendingSpots();
    let json = await response.json();
    setLoading(false);
    if (response.ok) {
      setSpots(json);
    }
  });

  useEffect(() => {
    initTrendingSpots();
  }, []);

  return loading ? (
    <div style={styles.progress}>
      <CircularProgress />
    </div>
  ) : (
    <List disablePadding style={styles.trendingList}>
      {spots.map((spot, i) => (
        <ListItem
          button
          key={spot.place_id}
          component={Link}
          to={`/spots/${spot.place_id}`}
          title={spot.name}
          style={large ? styles.listItemLarge : styles.listItemSmall}
        >
          <Avatar src={spot.image_url} alt={spot.name} />
          <ListItemText
            disableTypography={true}
            primary={
              <Typography variant="subtitle1" noWrap>
                {i + 1}. {spot.name}
              </Typography>
            }
            secondary={
              <Typography component="p" noWrap color="textSecondary">
                {spot.formatted_address}
              </Typography>
            }
          />
          <ListItemSecondaryAction style={styles.listItemSecondaryAction}>
            <Button
              size="small"
              component={Link}
              to={`/spots/${spot.place_id}`}
              title={spot.name}
              variant="outlined"
            >
              {I18n.t('detail')}
            </Button>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

export default React.memo(TrendingSpots);
