import React, { useCallback, useEffect, useState } from 'react';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';
import Link from '../molecules/Link';

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

const TrendingMaps = () => {
  const large = useMediaQuery('(min-width: 600px)');
  const [loading, setLoading] = useState(true);
  const [maps, setMaps] = useState([]);

  const initPopularMaps = useCallback(async () => {
    setLoading(true);
    const client = new ApiClient();
    let response = await client.fetchPopularMaps();
    let json = await response.json();
    setMaps(json);
    setLoading(false);
  });

  useEffect(() => {
    initPopularMaps();
  }, []);

  return loading ? (
    <div style={styles.progress}>
      <CircularProgress />
    </div>
  ) : (
    <List disablePadding>
      {maps.map((map, i) => (
        <ListItem
          button
          key={map.id}
          component={Link}
          to={`/maps/${map.id}`}
          title={map.name}
          style={large ? styles.listItemLarge : styles.listItemSmall}
        >
          <Avatar src={map.thumbnail_url} alt={map.name} />
          <ListItemText
            disableTypography={true}
            primary={
              <Typography variant="subtitle1" noWrap>
                {i + 1}. {map.name}
              </Typography>
            }
            secondary={
              <Typography component="p" noWrap color="textSecondary">
                {map.description}
              </Typography>
            }
          />
          <ListItemSecondaryAction style={styles.listItemSecondaryAction}>
            <Button
              size="small"
              component={Link}
              to={`/maps/${map.id}`}
              title={map.name}
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

export default React.memo(TrendingMaps);
