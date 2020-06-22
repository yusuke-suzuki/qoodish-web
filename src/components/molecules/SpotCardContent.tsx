import React, { useCallback } from 'react';

import useMediaQuery from '@material-ui/core/useMediaQuery';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import DragHandleIcon from '@material-ui/icons/DragHandle';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Skeleton from '@material-ui/lab/Skeleton';

import { Link } from '@yusuke-suzuki/rize-router';
import CreateReviewTile from '../molecules/CreateReviewTile';
import SpotCardHeader from './SpotCardHeader';
import { useMappedState } from 'redux-react-hook';

const styles = {
  cardContent: {
    paddingBottom: 16,
    paddingTop: 0
  },
  backButton: {
    marginLeft: 'auto',
    marginRight: 8,
    color: 'white'
  },
  toolbar: {
    backgroundImage: 'linear-gradient(to bottom,rgba(0,0,0,.5),rgba(0,0,0,0))',
    position: 'absolute',
    zIndex: 1,
    right: 0,
    left: 0
  },
  dragHandle: {
    textAlign: 'center',
    paddingTop: 2,
    height: 20
  },
  gridList: {
    flexWrap: 'nowrap',
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: 'translateZ(0)'
  },
  avatarGridTile: {
    width: 30,
    height: 30,
    marginLeft: 8,
    marginRight: 8
  },
  tileBar: {
    height: 50
  },
  infoButton: {
    padding: 0
  }
};

const SpotCardContent = () => {
  const smUp = useMediaQuery('(min-width: 600px)');

  const mapState = useCallback(
    state => ({
      currentSpot: state.spotCard.currentSpot,
      spotReviews: state.spotCard.spotReviews,
      currentMap: state.mapDetail.currentMap
    }),
    []
  );
  const { currentSpot, spotReviews, currentMap } = useMappedState(mapState);

  return (
    <CardContent style={styles.cardContent}>
      <div style={styles.dragHandle}>
        <DragHandleIcon color="disabled" />
      </div>
      <SpotCardHeader currentSpot={currentSpot} />
      <GridList
        cols={smUp ? 4.5 : 2.5}
        cellHeight={100}
        style={styles.gridList}
      >
        {currentMap.postable && (
          <GridListTile key="add-review">
            <CreateReviewTile currentSpot={currentSpot} />
          </GridListTile>
        )}
        {spotReviews.length < 1 && (
          <GridListTile>
            <Skeleton variant="rect" height={100} />
          </GridListTile>
        )}
        {spotReviews.map(review => (
          <GridListTile
            key={review.id}
            component={Link}
            to={{
              pathname: `/maps/${review.map.id}/reports/${review.id}`,
              state: { modal: true, review: review }
            }}
          >
            <img
              src={
                review.images.length > 0
                  ? review.images[0].thumbnail_url_400
                  : process.env.SUBSTITUTE_URL
              }
              alt={review.spot.name}
              loading="lazy"
            />
            <GridListTileBar
              style={styles.tileBar}
              actionIcon={
                <Avatar
                  src={review.author.profile_image_url}
                  alt={review.author.name}
                  style={styles.avatarGridTile}
                  loading="lazy"
                />
              }
              actionPosition="left"
              subtitle={review.comment}
            />
          </GridListTile>
        ))}
      </GridList>
    </CardContent>
  );
};

export default React.memo(SpotCardContent);
