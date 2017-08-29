import React, { Component } from 'react';
import { CircularProgress } from 'material-ui/Progress';
import RateReviewIcon from 'material-ui-icons/RateReview';
import Typography from 'material-ui/Typography';
import Avatar from 'material-ui/Avatar';
import moment from 'moment';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import Menu, { MenuItem } from 'material-ui/Menu';
import MoreVertIcon from 'material-ui-icons/MoreVert';
import ShareIcon from 'material-ui-icons/Share';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReviewCardContainer from '../containers/ReviewCardContainer';
import EditReviewDialogContainer from '../containers/EditReviewDialogContainer';
import DeleteReviewDialogContainer from '../containers/DeleteReviewDialogContainer';

const styles = {
  rootLarge: {
    margin: '94px auto 200px',
    width: '50%'
  },
  rootSmall: {
    margin: '64px auto 200px',
    width: '100%'
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 40,
    marginBottom: 20
  },
  buttonContainer: {
    textAlign: 'center',
    marginTop: 20
  },
  loadMoreButton: {
    width: '100%'
  },
  progress: {
    textAlign: 'center',
    padding: 10,
    marginTop: 20
  },
  noReviewsContainer: {
    textAlign: 'center',
    color: '#9e9e9e',
    marginTop: 20
  },
  noReviewsIcon: {
    width: 150,
    height: 150
  },
  profileImage: {
    width: 40
  },
};

export default class Feed extends Component {
  constructor(props) {
    super(props);
    this.handleClickLoadMoreButton = this.handleClickLoadMoreButton.bind(this);
  }

  componentWillMount() {
    this.props.updatePageTitle();
    this.props.refreshReviews();
  }

  handleClickLoadMoreButton() {
    this.props.loadMoreReviews(this.props.nextTimestamp);
  }

  renderProgress() {
    return (
      <div style={styles.progress}>
        <CircularProgress />
      </div>
    );
  }

  renderLoadMoreButton() {
    if (this.props.noMoreReviews) {
      return null;
    }
    return (
      <div style={styles.buttonContainer}>
        <Button raised onClick={this.handleClickLoadMoreButton} style={styles.loadMoreButton}>
          Load More
        </Button>
      </div>
    );
  }

  render() {
    return (
      <div style={this.props.large ? styles.rootLarge : styles.rootSmall}>
        <div style={styles.container}>
          {this.props.loadingReviews ? this.renderProgress() : this.renderReviewContainer(this.props.currentReviews)}
        </div>
        <EditReviewDialogContainer />
        <DeleteReviewDialogContainer />
      </div>
    );
  }

  renderNoReviews() {
    return (
      <div style={styles.noReviewsContainer}>
        <RateReviewIcon style={styles.noReviewsIcon} />
        <Typography type='subheading' color='inherit'>
          No posts.
        </Typography>
      </div>
    );
  }

  renderReviewContainer(reviews) {
    if (reviews.length > 0) {
      return (
        <div>
          {this.renderReviewCards(reviews)}
          {this.props.loadingMoreReviews ? this.renderProgress() : this.renderLoadMoreButton()}
        </div>
      );
    } else {
      return this.renderNoReviews();
    }
  }

  renderReviewCards(reviews) {
    return reviews.map((review) => (
      <ReviewCardContainer currentReview={review} />
    ));
  }
}
