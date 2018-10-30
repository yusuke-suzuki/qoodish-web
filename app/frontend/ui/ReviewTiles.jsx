import React from 'react';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import Typography from '@material-ui/core/Typography';
import I18n from '../containers/I18n';

const styles = {
  gridContainer: {
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

const Subheader = (props) => {
  return (
    <Typography
      variant="subtitle2"
      gutterBottom
      color="textSecondary"
    >
      {`${props.reviews.length} ${I18n.t('reviews count')}`}
    </Typography>
  );
}

const ReviewGridList = (props) => {
  return (
    <div>
      {props.showSubheader && <Subheader {...props} />}
      <div style={styles.gridContainer}>
        <GridList
          style={styles.gridList}
          cols={props.cols}
          spacing={props.spacing}
          cellHeight={props.cellHeight}
        >
          {props.reviews.map(review => (
            <GridListTile
              key={review.id}
              onClick={() => props.handleReviewClick(review)}
              style={styles.gridTile}
            >
              <img
                src={review.image ? review.image.thumbnail_url : process.env.SUBSTITUTE_URL}
                alt={review.spot.name}
              />
            </GridListTile>
          ))}
        </GridList>
      </div>
    </div>
  );
}

ReviewGridList.defaultProps = {
  cols: 3,
  spacing: 4,
  cellHeight: 100
};

export default ReviewGridList;
