import React from 'react';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

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
        cols={props.large ? 4 : 3}
        style={styles.gridList}
        spacing={props.large ? 20 : 4}
        cellHeight={props.large ? 220 : 120}
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
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
}

export default ReviewGridList;
