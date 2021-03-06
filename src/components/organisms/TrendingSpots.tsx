import React, { useCallback, useContext, useEffect, useState } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Link } from '@yusuke-suzuki/rize-router';

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
import PlaceIcon from '@material-ui/icons/Place';

import I18n from '../../utils/I18n';
import { ApiClient, SpotsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import SkeletonTrendingList from '../molecules/SkeletonTrendingList';
import AuthContext from '../../context/AuthContext';
import { useTheme } from '@material-ui/core';

const styles = {
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

const TrendingSpots = () => {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const [spots, setSpots] = useState([]);

  const { currentUser } = useContext(AuthContext);

  const initTrendingSpots = useCallback(async () => {
    const apiInstance = new SpotsApi();
    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';
    const opts = {
      popular: true
    };
    apiInstance.spotsGet(opts, (error, data, response) => {
      if (response.ok) {
        setSpots(response.body);
      }
    });
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      return;
    }
    initTrendingSpots();
  }, [currentUser]);

  return spots.length < 1 ? (
    <SkeletonTrendingList />
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
                <PlaceIcon style={styles.headerIcon} />{' '}
                {I18n.t('trending spots')}
              </Typography>
            </ListSubheader>
          }
        >
          {spots.map((spot, i) => (
            <ListItem
              button
              key={spot.place_id}
              component={Link}
              to={{
                pathname: `/spots/${spot.place_id}`,
                state: { modal: true, spot: spot }
              }}
              title={spot.name}
              style={smUp ? styles.listItemLarge : styles.listItemSmall}
            >
              <ListItemAvatar>
                <Avatar
                  src={spot.thumbnail_url}
                  alt={spot.name}
                  loading="lazy"
                />
              </ListItemAvatar>
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
                  to={{
                    pathname: `/spots/${spot.place_id}`,
                    state: { modal: true, spot: spot }
                  }}
                  title={spot.name}
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

export default React.memo(TrendingSpots);
