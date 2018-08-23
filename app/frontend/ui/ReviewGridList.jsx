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

export default class ReviewGridList extends React.PureComponent {
  render() {
    return (
      <div style={styles.container}>
        <GridList
          cols={this.props.large ? 4 : 2}
          style={styles.gridList}
          spacing={this.props.large ? 20 : 10}
          cellHeight={220}
        >
          {this.renderReviews(this.props.reviews)}
        </GridList>
      </div>
    );
  }

  reviewImage(review) {
    if (this.props.large) {
      return review.image.url;
    } else {
      return review.image.thumbnail_url;
    }
  }

  renderReviews(reviews) {
    return reviews.map(review => (
      <GridListTile
        key={review.id}
        onClick={() => this.props.handleReviewClick(review)}
        style={styles.gridTile}
      >
        <img
          src={review.image ? this.reviewImage(review) : process.env.SUBSTITUTE_URL}
          alt={review.spot.name}
        />
        <GridListTileBar
          title={review.spot.name}
          subtitle={review.map_name}
        />
      </GridListTile>
    ));
  }
}
