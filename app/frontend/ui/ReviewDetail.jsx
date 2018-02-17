import React, { Component } from 'react';
import Typography from 'material-ui/Typography';
import ReviewCardContainer from '../containers/ReviewCardContainer';
import { CircularProgress } from 'material-ui/Progress';
import RateReviewIcon from 'material-ui-icons/RateReview';
import EditReviewDialogContainer from '../containers/EditReviewDialogContainer';
import DeleteReviewDialogContainer from '../containers/DeleteReviewDialogContainer';

const styles = {
  containerLarge: {
    margin: '94px auto 200px',
    width: '40%'
  },
  containerSmall: {
    margin: '56px auto 0'
  },
  progress: {
    textAlign: 'center',
    paddingTop: 20
  },
  noContentsContainer: {
    textAlign: 'center',
    color: '#9e9e9e',
    paddingTop: 20
  },
  noContentsIcon: {
    width: 150,
    height: 150
  }
};


class ReviewDetail extends Component {
  componentWillMount() {
    this.props.updatePageTitle();
    if (!this.props.currentReview) {
      this.props.fetchReview();
    }
  }

  componentWillUnmount() {
    this.props.clear();
  }

  render() {
    return (
      <div style={this.props.large ? styles.containerLarge : styles.containerSmall}>
        {this.props.reviewLoading ? this.renderProgress() : this.renderReviewCard()}
        <EditReviewDialogContainer mapId={this.props.match.params.mapId} />
        <DeleteReviewDialogContainer />
      </div>
    );
  }

  renderReviewCard() {
    if (this.props.currentReview) {
      return <ReviewCardContainer currentReview={this.props.currentReview} detail={!this.props.large} />;
    } else {
      return this.renderNoContent();
    }
  }

  renderProgress() {
    return (
      <div style={styles.progress}>
        <CircularProgress />
      </div>
    );
  }

  renderNoContent() {
    return (
      <div style={styles.noContentsContainer}>
        <RateReviewIcon style={styles.noContentsIcon} />
        <Typography type='subheading' color='inherit'>
          Report not found.
        </Typography>
      </div>
    );
  }
}

export default ReviewDetail;
