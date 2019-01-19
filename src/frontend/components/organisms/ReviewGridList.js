import React, { useCallback } from 'react';
import { useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import PlaceIcon from '@material-ui/icons/Place';

import openReviewDialog from '../../actions/openReviewDialog';

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  gridList: {
    width: '100%'
  },
  gridTile: {
    cursor: 'pointer'
  },
  tileBar: {
    height: '100%',
    textAlign: 'center'
  },
  placeIconLarge: {
    fontSize: 64
  },
  placeIconSmall: {
    fontSize: 36
  }
};

const reviewImage = (review, large) => {
  if (large) {
    return review.image.url;
  } else {
    return review.image.thumbnail_url;
  }
};

const ReviewGridList = props => {
  const large = useMediaQuery('(min-width: 600px)');
  const dispatch = useDispatch();
  const handleReviewClick = useCallback(review => {
    dispatch(openReviewDialog(review));
  });

  return (
    <div style={styles.container}>
      <GridList
        cols={large ? 4 : 3}
        style={styles.gridList}
        spacing={large ? 20 : 4}
        cellHeight={large ? 220 : 120}
      >
        {props.reviews.map(review => (
          <GridListTile
            key={review.id}
            onClick={() => handleReviewClick(review)}
            style={styles.gridTile}
          >
            {review.image ? (
              <img
                src={reviewImage(review, props.large)}
                alt={review.spot.name}
              />
            ) : (
              <GridListTileBar
                title={
                  <PlaceIcon
                    style={
                      props.large
                        ? styles.placeIconLarge
                        : styles.placeIconSmall
                    }
                  />
                }
                style={styles.tileBar}
              />
            )}
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
};

export default React.memo(ReviewGridList);
