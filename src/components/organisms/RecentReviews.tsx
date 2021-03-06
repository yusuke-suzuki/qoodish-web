import React, { useCallback, useState, useEffect, useContext } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Link } from '@yusuke-suzuki/rize-router';

import CardMedia from '@material-ui/core/CardMedia';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import NoContents from '../molecules/NoContents';
import moment from 'moment';

import I18n from '../../utils/I18n';
import fetchRecentReviews from '../../actions/fetchRecentReviews';
import openToast from '../../actions/openToast';
import { ApiClient, ReviewsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import Skeleton from '@material-ui/lab/Skeleton';
import AuthContext from '../../context/AuthContext';
import { useTheme } from '@material-ui/core';

const styles = {
  gridList: {
    flexWrap: 'nowrap',
    transform: 'translateZ(0)',
    width: '100%'
  },
  gridTile: {
    cursor: 'pointer',
    textDecoration: 'none'
  },
  reviewCard: {
    margin: 3
  },
  reviewComment: {
    height: '4.5em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    WebkitLineClamp: '3',
    WebkitBoxOrient: 'vertical',
    display: '-webkit-box',
    wordBreak: 'break-all'
  },
  secondaryAvatarLarge: {
    borderRadius: 0,
    marginRight: 24,
    width: 80,
    height: 80
  },
  secondaryAvatarSmall: {
    borderRadius: 0,
    marginRight: 16,
    width: 80,
    height: 80
  },
  cardMedia: {
    marginBottom: -5
  },
  cardContent: {
    paddingBottom: 16
  },
  reviewImage: {
    width: '100%',
    height: 180,
    objectFit: 'cover'
  },
  author: {
    width: '90%'
  }
};

const RecentReviews = () => {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      recentReviews: state.discover.recentReviews
    }),
    []
  );
  const { recentReviews } = useMappedState(mapState);

  const { currentUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);

  const initRecentReviews = useCallback(async () => {
    setLoading(true);

    const apiInstance = new ReviewsApi();
    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';

    const opts = {
      recent: true
    };
    apiInstance.reviewsGet(opts, (error, data, response) => {
      setLoading(false);

      if (response.ok) {
        dispatch(fetchRecentReviews(response.body));
      } else if (response.status == 401) {
        dispatch(openToast('Authenticate failed'));
      } else {
        dispatch(openToast('Failed to fetch reports.'));
      }
    });
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      return;
    }
    initRecentReviews();
  }, [currentUser]);

  if (!loading && recentReviews.length < 1) {
    return (
      <NoContents
        contentType="review"
        message={I18n.t('reports will see here')}
      />
    );
  } else {
    return (
      <GridList
        cols={smUp ? 2.5 : 1.2}
        style={styles.gridList}
        spacing={smUp ? 20 : 10}
        cellHeight={440}
      >
        {loading
          ? Array.from(new Array(8)).map((v, i) => (
              <GridListTile key={i}>
                <Card style={styles.reviewCard} elevation={0}>
                  <CardHeader
                    avatar={
                      <Skeleton variant="circle" width={40} height={40} />
                    }
                    title={<Skeleton height={20} width="40%" />}
                    subheader={<Skeleton height={20} width="40%" />}
                  />
                  <Skeleton variant="rect" height={180} />
                  <CardContent style={styles.cardContent}>
                    <Skeleton height={30} width="40%" />
                    <Skeleton height={38} width="40%" />
                    <Skeleton height={26} width="100%" />
                    <Skeleton height={26} width="100%" />
                    <Skeleton height={26} width="100%" />
                  </CardContent>
                </Card>
              </GridListTile>
            ))
          : recentReviews.map(review => (
              <GridListTile
                key={review.id}
                style={styles.gridTile}
                component={Link}
                to={{
                  pathname: `/maps/${review.map.id}/reports/${review.id}`,
                  state: { modal: true, review: review }
                }}
              >
                <Card style={styles.reviewCard} elevation={0}>
                  <CardHeader
                    avatar={
                      <Avatar
                        src={review.author.profile_image_url}
                        alt={review.author.name}
                        loading="lazy"
                      />
                    }
                    title={
                      <Typography
                        variant="subtitle2"
                        color="textPrimary"
                        noWrap
                        style={styles.author}
                      >
                        {review.author.name}
                      </Typography>
                    }
                    subheader={moment(
                      review.created_at,
                      'YYYY-MM-DDThh:mm:ss.SSSZ'
                    )
                      .locale(I18n.locale)
                      .fromNow()}
                  />
                  <CardMedia style={styles.cardMedia}>
                    <img
                      src={
                        review.images.length > 0
                          ? review.images[0].thumbnail_url_400
                          : process.env.SUBSTITUTE_URL
                      }
                      alt={review.spot.name}
                      style={styles.reviewImage}
                      loading="lazy"
                    />
                  </CardMedia>
                  <CardContent style={styles.cardContent}>
                    <Typography
                      variant="subtitle1"
                      color="primary"
                      gutterBottom
                      noWrap
                    >
                      {review.map.name}
                    </Typography>
                    <Typography variant="h6" gutterBottom noWrap>
                      {review.spot.name}
                    </Typography>
                    <Typography component="p" style={styles.reviewComment}>
                      {review.comment}
                    </Typography>
                  </CardContent>
                </Card>
              </GridListTile>
            ))}
      </GridList>
    );
  }
};

export default React.memo(RecentReviews);
