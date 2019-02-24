import React, { useCallback, useState, useEffect } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';
import Link from '../molecules/Link';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import PersonIcon from '@material-ui/icons/Person';
import Chip from '@material-ui/core/Chip';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import NoContents from '../molecules/NoContents';
import moment from 'moment';

import I18n from '../../utils/I18n';
import fetchRecentReviews from '../../actions/fetchRecentReviews';
import openToast from '../../actions/openToast';
import initializeApiClient from '../../utils/initializeApiClient';
import { ReviewsApi } from 'qoodish_api';

const styles = {
  gridListLarge: {
    width: '100%'
  },
  gridListSmall: {
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
  cardContentLarge: {
    paddingTop: 0,
    paddingRight: 120
  },
  cardContentSmall: {
    paddingTop: 0,
    paddingRight: 112
  },
  reviewImage: {
    width: '100%'
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
  skeltonTextPrimary: {
    width: '100%',
    height: '1.25rem'
  },
  skeltonTextSecondary: {
    width: '50%',
    height: '1rem'
  },
  skeltonTextComment: {
    width: '100%',
    height: '1rem'
  },
  skeltonAvatar: {
    width: 40,
    height: 40
  }
};

const RecentReviews = () => {
  const large = useMediaQuery('(min-width: 600px)');

  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      recentReviews: state.discover.recentReviews
    }),
    []
  );
  const { recentReviews } = useMappedState(mapState);

  const [loading, setLoading] = useState(true);

  const initRecentReviews = useCallback(async () => {
    setLoading(true);

    await initializeApiClient();
    const apiInstance = new ReviewsApi();

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
  });

  useEffect(() => {
    initRecentReviews();
  }, []);

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
        cols={large ? 2 : 1.2}
        style={large ? styles.gridListLarge : styles.gridListSmall}
        spacing={20}
        cellHeight={240}
      >
        {loading
          ? Array.from(new Array(8)).map((v, i) => (
              <GridListTile key={i}>
                <Card style={styles.reviewCard}>
                  <CardHeader
                    avatar={
                      <Avatar style={styles.skeltonAvatar}>
                        <PersonIcon />
                      </Avatar>
                    }
                    title={<Chip style={styles.skeltonTextSecondary} />}
                    subheader={<Chip style={styles.skeltonTextSecondary} />}
                  />
                  <CardContent
                    style={
                      large ? styles.cardContentLarge : styles.cardContentSmall
                    }
                  >
                    <Typography
                      variant="subtitle1"
                      color="primary"
                      gutterBottom
                    >
                      <Chip style={styles.skeltonTextSecondary} />
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      <Chip style={styles.skeltonTextPrimary} />
                    </Typography>
                    <Typography component="p" style={styles.reviewComment}>
                      <Chip style={styles.skeltonTextComment} />
                      <Chip style={styles.skeltonTextComment} />
                      <Chip style={styles.skeltonTextComment} />
                    </Typography>
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
                <Card style={styles.reviewCard}>
                  <CardHeader
                    avatar={
                      <Avatar
                        src={review.author.profile_image_url}
                        alt={review.author.name}
                      />
                    }
                    title={review.author.name}
                    subheader={moment(
                      review.created_at,
                      'YYYY-MM-DDThh:mm:ss.SSSZ'
                    )
                      .locale(window.currentLocale)
                      .fromNow()}
                  />
                  <CardContent
                    style={
                      large ? styles.cardContentLarge : styles.cardContentSmall
                    }
                  >
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
                {review.image && (
                  <ListItemSecondaryAction>
                    <Avatar
                      src={review.image.thumbnail_url}
                      alt={review.spot.name}
                      style={
                        large
                          ? styles.secondaryAvatarLarge
                          : styles.secondaryAvatarSmall
                      }
                    />
                  </ListItemSecondaryAction>
                )}
              </GridListTile>
            ))}
      </GridList>
    );
  }
};

export default React.memo(RecentReviews);
