import React from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import PlaceIcon from '@material-ui/icons/Place';

import Link from '../molecules/Link';

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

  return (
    <div style={styles.container}>
      <GridList
        cols={large ? 4 : 3}
        style={styles.gridList}
        spacing={large ? 20 : 4}
        cellHeight={large ? 165 : 120}
      >
        {props.reviews.map(review => (
          <GridListTile
            key={review.id}
            style={styles.gridTile}
            component={Link}
            to={{
              pathname: `/maps/${review.map.id}/reports/${review.id}`,
              state: { modal: true, review: review }
            }}
          >
            {review.image ? (
              <img
                loading="lazy"
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
