import React, { useCallback, useState, useEffect } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import {
  GridList,
  GridListTile,
  GridListTileBar,
  Typography,
  Avatar,
  useMediaQuery
} from '@material-ui/core';
import selectMapSpot from '../../actions/selectMapSpot';
import openSpotCard from '../../actions/openSpotCard';
import requestMapCenter from '../../actions/requestMapCenter';
import I18n from '../../utils/I18n';
import Skeleton from '@material-ui/lab/Skeleton';
import ReviewsApi from '@yusuke-suzuki/qoodish-api-js-client/dist/api/ReviewsApi';

const styles = {
  root: {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    height: 124,
    background: 'rgba(0, 0, 0, 0.1)'
  },
  container: {
    padding: 12
  },
  gridList: {
    flexWrap: 'nowrap',
    transform: 'translateZ(0)'
  },
  tileBar: {
    height: '50%'
  },
  reviewerContainer: {
    display: 'flex',
    position: 'absolute',
    zIndex: 1,
    right: 18,
    top: 8
  },
  reviewerAvatar: {
    width: 24,
    height: 24,
    marginRight: -10.66666667,
    borderColor: '#fff',
    backgroundColor: '#fff',
    borderRadius: '50%',
    borderStyle: 'solid',
    float: 'right',
    borderWidth: 1,
    cursor: 'pointer'
  },
  skeletonAvatar: {
    width: 24,
    height: 24,
    marginRight: -10.66666667,
    float: 'right'
  },
  spotImage: {
    width: '100%',
    objectFit: 'cover',
    height: 100
  }
};

const Reviewers = props => {
  return props.reviews
    .slice(0, 3)
    .map(review => (
      <Avatar
        key={review.author.id}
        src={review.author.profile_image_url}
        alt={review.author.name}
        style={styles.reviewerAvatar}
      />
    ));
};

const SkeletonTile = React.memo(() => {
  return (
    <React.Fragment>
      <div style={styles.reviewerContainer}>
        <Skeleton variant="circle" style={styles.skeletonAvatar} />
      </div>
      <Skeleton variant="rect" height={100} />
      <GridListTileBar
        style={styles.tileBar}
        title={<Skeleton height={16} width="100%" />}
        subtitle={<Skeleton height={16} width="80%" />}
      />
    </React.Fragment>
  );
});

const SpotTile = React.memo(props => {
  const { spot } = props;
  const [reviews, setReviews] = useState([]);
  const dispatch = useDispatch();

  const handleSpotClick = useCallback(
    spot => {
      dispatch(selectMapSpot(spot));
      dispatch(openSpotCard());
      dispatch(requestMapCenter(spot.lat, spot.lng));
    },
    [dispatch, spot]
  );

  const initSpotReviews = useCallback(async () => {
    const apiInstance = new ReviewsApi();

    apiInstance.mapsMapIdSpotsPlaceIdReviewsGet(
      spot.map_id,
      spot.place_id,
      (error, data, response) => {
        if (response.ok) {
          setReviews(response.body);
        }
      }
    );
  }, [spot]);

  useEffect(() => {
    if (spot) {
      initSpotReviews();
    }
  }, [spot]);

  return (
    <div onClick={() => handleSpotClick(spot)}>
      <div style={styles.reviewerContainer}>
        <Reviewers reviews={reviews} />
      </div>
      <img
        src={spot.thumbnail_url_400}
        alt={spot.name}
        loading="lazy"
        style={styles.spotImage}
      />
      <GridListTileBar
        style={styles.tileBar}
        title={
          <Typography variant="subtitle2" color="inherit" noWrap>
            {spot.name}
          </Typography>
        }
        subtitle={
          <Typography variant="caption" color="inherit" noWrap>
            {`${spot.reviews_count} ${I18n.t('reviews count')}`}
          </Typography>
        }
      />
    </div>
  );
});

const Container = React.memo(props => {
  const smUp = useMediaQuery('(min-width: 600px)');

  return (
    <div style={styles.root}>
      <div style={styles.container}>
        <GridList
          spacing={12}
          cols={smUp ? 4.5 : 2.5}
          cellHeight={100}
          style={styles.gridList}
        >
          {props.children.map(child => (
            <GridListTile key={child.key}>{child}</GridListTile>
          ))}
        </GridList>
      </div>
    </div>
  );
});

const SpotHorizontalList = () => {
  const mapState = useCallback(
    state => ({
      spots: state.gMap.spots
    }),
    []
  );

  const { spots } = useMappedState(mapState);

  if (spots.length < 1) {
    return (
      <Container>
        {Array.from(new Array(3)).map((v, i) => (
          <SkeletonTile key={i} />
        ))}
      </Container>
    );
  }

  return (
    <Container>
      {spots.map(spot => (
        <SpotTile key={spot.place_id} spot={spot} />
      ))}
    </Container>
  );
};

export default React.memo(SpotHorizontalList);
