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

export default class ReviewGridList extends React.PureComponent {
  render() {
    return (
      <div>
        {this.props.showSubheader && this.renderSubheader()}
        {this.renderGridList()}
      </div>
    );
  }

  renderSubheader() {
    return (
      <Typography
        variant="subtitle2"
        gutterBottom
        color="textSecondary"
      >
        {`${this.props.reviews.length} ${I18n.t('reviews count')}`}
      </Typography>
    );
  }

  renderGridList() {
    return (
      <div style={styles.gridContainer}>
        <GridList
          cols={this.props.cols ? this.props.cols : 3}
          style={styles.gridList}
          spacing={this.props.spacing ? this.props.spacing : 4}
          cellHeight={this.props.cellHeight ? this.props.cellHeight : 100}
        >
          {this.renderReviewTiles(this.props.reviews)}
        </GridList>
      </div>
    );
  }

  renderReviewTiles(reviews) {
    return reviews.map(review => (
      <GridListTile
        key={review.id}
        onClick={() => this.props.handleReviewClick(review)}
        style={styles.gridTile}
      >
        <img
          src={review.image ? review.image.thumbnail_url : process.env.SUBSTITUTE_URL}
          alt={review.spot.name}
        />
      </GridListTile>
    ));
  }
}
