import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import {
  GridList,
  GridListTile,
  GridListTileBar,
  Typography,
  Avatar,
  useMediaQuery
} from '@material-ui/core';
import selectSpot from '../../actions/selectSpot';
import openSpotCard from '../../actions/openSpotCard';
import requestMapCenter from '../../actions/requestMapCenter';
import I18n from '../../utils/I18n';
import Skeleton from '@material-ui/lab/Skeleton';

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
  }
};

const Reviewers = props => {
  return props.spot.reviews
    .slice(0, 3)
    .map(review => (
      <Avatar
        src={review.author.profile_image_url}
        alt={review.author.name}
        style={styles.reviewerAvatar}
      />
    ));
};

const SpotHorizontalList = () => {
  const dispatch = useDispatch();
  const smUp = useMediaQuery('(min-width: 600px)');

  const mapState = useCallback(
    state => ({
      spots: state.gMap.spots
    }),
    []
  );

  const { spots } = useMappedState(mapState);

  const handleSpotClick = useCallback(spot => {
    dispatch(selectSpot(spot));
    dispatch(openSpotCard());
    dispatch(requestMapCenter(spot.lat, spot.lng));
  });

  if (spots.length < 1) {
    return (
      <div style={styles.root}>
        <div style={styles.container}>
          <GridList
            spacing={12}
            cols={smUp ? 4.5 : 2.5}
            cellHeight={100}
            style={styles.gridList}
          >
            {Array.from(new Array(3)).map((v, i) => (
              <GridListTile key={i}>
                <div style={styles.reviewerContainer}>
                  <Skeleton variant="circle" style={styles.skeletonAvatar} />
                </div>
                <Skeleton variant="rect" height={100} />
                <GridListTileBar
                  style={styles.tileBar}
                  title={<Skeleton height={16} width="100%" />}
                  subtitle={<Skeleton height={16} width="80%" />}
                />
              </GridListTile>
            ))}
          </GridList>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <div style={styles.container}>
        <GridList
          spacing={12}
          cols={smUp ? 4.5 : 2.5}
          cellHeight={100}
          style={styles.gridList}
        >
          {spots.map(spot => (
            <GridListTile
              key={spot.place_id}
              onClick={() => handleSpotClick(spot)}
            >
              <div style={styles.reviewerContainer}>
                <Reviewers spot={spot} />
              </div>
              <img
                src={spot.thumbnail_url_400}
                alt={spot.name}
                loading="lazy"
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
                    {`${spot.reviews.length} ${I18n.t('reviews count')}`}
                  </Typography>
                }
              />
            </GridListTile>
          ))}
        </GridList>
      </div>
    </div>
  );
};

export default React.memo(SpotHorizontalList);