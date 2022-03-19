import React, { useCallback, useState, useEffect, useContext } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import CardMedia from '@material-ui/core/CardMedia';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import NoContents from '../molecules/NoContents';

import I18n from '../../utils/I18n';
import fetchRecentReviews from '../../actions/fetchRecentReviews';
import openToast from '../../actions/openToast';
import { ApiClient, ReviewsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import Skeleton from '@material-ui/lab/Skeleton';
import AuthContext from '../../context/AuthContext';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core';
import ReviewLink from '../molecules/ReviewLink';
import { formatDistanceToNow } from 'date-fns';
import { enUS, ja } from 'date-fns/locale';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    gridList: {
      flexWrap: 'nowrap',
      transform: 'translateZ(0)',
      width: '100%'
    },
    reviewCard: {
      margin: 3
    },
    reviewComment: {
      height: '4.5em',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      display: '-webkit-box',
      wordBreak: 'break-all'
    },
    cardMedia: {
      marginBottom: -5
    },
    cardContent: {
      paddingBottom: theme.spacing(2)
    },
    reviewImage: {
      width: '100%',
      height: 180,
      objectFit: 'cover'
    },
    author: {
      width: '90%'
    }
  })
);

const RecentReviews = () => {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const classes = useStyles();

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
        className={classes.gridList}
        spacing={10}
        cellHeight={464}
      >
        {loading
          ? Array.from(new Array(8)).map((v, i) => (
              <GridListTile key={i}>
                <Card className={classes.reviewCard} elevation={0}>
                  <CardHeader
                    avatar={
                      <Skeleton variant="circle" width={40} height={40} />
                    }
                    title={<Skeleton height={20} width="40%" />}
                    subheader={<Skeleton height={20} width="40%" />}
                  />
                  <Skeleton variant="rect" height={180} />
                  <CardContent className={classes.cardContent}>
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
              <GridListTile key={review.id}>
                <ReviewLink review={review}>
                  <Card className={classes.reviewCard} elevation={0}>
                    <CardHeader
                      avatar={
                        review.author.profile_image_url ? (
                          <Avatar
                            src={review.author.profile_image_url}
                            imgProps={{
                              alt: review.author.name,
                              loading: 'lazy'
                            }}
                          />
                        ) : (
                          <Avatar>{review.author.name.slice(0, 1)}</Avatar>
                        )
                      }
                      title={
                        <Typography
                          variant="subtitle2"
                          color="textPrimary"
                          noWrap
                          className={classes.author}
                        >
                          {review.author.name}
                        </Typography>
                      }
                      subheader={formatDistanceToNow(
                        new Date(review.created_at),
                        {
                          addSuffix: true,
                          locale: I18n.locale.includes('ja') ? ja : enUS
                        }
                      )}
                    />
                    <CardMedia className={classes.cardMedia}>
                      <img
                        src={
                          review.images.length > 0
                            ? review.images[0].thumbnail_url_400
                            : process.env.NEXT_PUBLIC_SUBSTITUTE_URL
                        }
                        alt={review.spot.name}
                        className={classes.reviewImage}
                        loading="lazy"
                      />
                    </CardMedia>
                    <CardContent className={classes.cardContent}>
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
                      <Typography
                        component="p"
                        className={classes.reviewComment}
                      >
                        {review.comment}
                      </Typography>
                    </CardContent>
                  </Card>
                </ReviewLink>
              </GridListTile>
            ))}
      </GridList>
    );
  }
};

export default React.memo(RecentReviews);
