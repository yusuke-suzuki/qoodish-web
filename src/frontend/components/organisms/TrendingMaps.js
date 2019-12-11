import React, { useCallback, useEffect, useState } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useMappedState } from 'redux-react-hook';
import { Link } from '@yusuke-suzuki/rize-router';

import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import CardContent from '@material-ui/core/CardContent';
import GradeIcon from '@material-ui/icons/Grade';

import { MapsApi } from '@yusuke-suzuki/qoodish-api-js-client';

import I18n from '../../utils/I18n';

const styles = {
  progress: {
    textAlign: 'center',
    padding: 10,
    marginTop: 20
  },
  listItemLarge: {
    paddingLeft: 10,
    paddingRight: 80
  },
  listItemSmall: {
    paddingLeft: 10,
    paddingRight: 80
  },
  listItemSecondaryAction: {
    right: 10
  },
  gridHeader: {
    width: '100%',
    display: 'inline-flex'
  },
  headerIcon: {
    marginLeft: 10,
    marginRight: 10
  },
  cardContainer: {
    paddingBottom: 16
  }
};

const TrendingMaps = () => {
  const large = useMediaQuery('(min-width: 600px)');
  const [loading, setLoading] = useState(true);
  const [maps, setMaps] = useState([]);

  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser
    }),
    []
  );

  const { currentUser } = useMappedState(mapState);

  const initPopularMaps = useCallback(async () => {
    setLoading(true);

    const apiInstance = new MapsApi();
    const opts = {
      popular: true
    };

    apiInstance.mapsGet(opts, (error, data, response) => {
      setLoading(false);
      if (response.ok) {
        const maps = response.body;
        setMaps(maps);
      } else {
        console.log(error);
      }
    });
  });

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      setLoading(false);
      return;
    }
    initPopularMaps();
  }, [currentUser.uid]);

  return loading ? (
    <div style={styles.progress}>
      <CircularProgress />
    </div>
  ) : (
    <Paper elevation={0}>
      <CardContent style={styles.cardContainer}>
        <List
          disablePadding
          subheader={
            <ListSubheader disableGutters>
              <Typography
                variant="subtitle1"
                color="textSecondary"
                style={styles.gridHeader}
              >
                <GradeIcon style={styles.headerIcon} />{' '}
                {I18n.t('trending maps')}
              </Typography>
            </ListSubheader>
          }
        >
          {maps.map((map, i) => (
            <ListItem
              button
              key={map.id}
              component={Link}
              to={`/maps/${map.id}`}
              title={map.name}
              style={large ? styles.listItemLarge : styles.listItemSmall}
            >
              <ListItemAvatar>
                <Avatar src={map.thumbnail_url} alt={map.name} />
              </ListItemAvatar>
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
      </CardContent>
    </Paper>
  );
};

export default React.memo(TrendingMaps);
