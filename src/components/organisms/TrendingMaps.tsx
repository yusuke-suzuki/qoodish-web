import React, { useCallback, useContext, useEffect, useState } from 'react';
import Link from 'next/link';

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

import { ApiClient, MapsApi } from '@yusuke-suzuki/qoodish-api-js-client';

import SkeletonTrendingList from '../molecules/SkeletonTrendingList';
import { createStyles, makeStyles } from '@material-ui/core';
import AuthContext from '../../context/AuthContext';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles(theme =>
  createStyles({
    progress: {
      textAlign: 'center',
      padding: 10,
      marginTop: 20
    },
    listItem: {
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
      paddingBottom: theme.spacing(2)
    }
  })
);

const TrendingMaps = () => {
  const classes = useStyles();
  const { I18n } = useLocale();

  const [maps, setMaps] = useState([]);

  const { currentUser } = useContext(AuthContext);

  const initPopularMaps = useCallback(async () => {
    const apiInstance = new MapsApi();
    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';
    const opts = {
      popular: true
    };

    apiInstance.mapsGet(opts, (error, data, response) => {
      if (response.ok) {
        const maps = response.body;
        setMaps(maps);
      } else {
        console.log(error);
      }
    });
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      return;
    }
    initPopularMaps();
  }, [currentUser]);

  return maps.length < 1 ? (
    <SkeletonTrendingList />
  ) : (
    <Paper elevation={0}>
      <CardContent className={classes.cardContainer}>
        <List
          disablePadding
          subheader={
            <ListSubheader disableGutters>
              <Typography
                variant="subtitle1"
                color="textSecondary"
                className={classes.gridHeader}
              >
                <GradeIcon className={classes.headerIcon} />{' '}
                {I18n.t('trending maps')}
              </Typography>
            </ListSubheader>
          }
        >
          {maps.map((map, i) => (
            <Link key={map.id} href={`/maps/${map.id}`} passHref>
              <ListItem button title={map.name} className={classes.listItem}>
                <ListItemAvatar>
                  <Avatar
                    src={map.thumbnail_url}
                    alt={map.name}
                    imgProps={{
                      loading: 'lazy'
                    }}
                  />
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
                <ListItemSecondaryAction
                  className={classes.listItemSecondaryAction}
                >
                  <Link href={`/maps/${map.id}`} passHref>
                    <Button size="small" title={map.name} variant="outlined">
                      {I18n.t('detail')}
                    </Button>
                  </Link>
                </ListItemSecondaryAction>
              </ListItem>
            </Link>
          ))}
        </List>
      </CardContent>
    </Paper>
  );
};

export default React.memo(TrendingMaps);
