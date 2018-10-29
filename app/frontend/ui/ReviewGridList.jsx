import React from 'react';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';

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
  }
};

const reviewImage = (review, large) => {
  if (large) {
    return review.image.url;
  } else {
    return review.image.thumbnail_url;
  }
}

const ReviewGridList = (props) => {
  return (
    <div style={styles.container}>
      <GridList
        cols={props.large ? 4 : 2}
        style={styles.gridList}
        spacing={props.large ? 20 : 10}
        cellHeight={220}
      >
        {props.reviews.map(review => (
          <GridListTile
            key={review.id}
            onClick={() => props.handleReviewClick(review)}
            style={styles.gridTile}
          >
            <img
              src={review.image ? reviewImage(review, props.large) : process.env.SUBSTITUTE_URL}
              alt={review.spot.name}
            />
            <GridListTileBar
              title={review.spot.name}
              subtitle={review.map.name}
            />
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
}

export default ReviewGridList;
