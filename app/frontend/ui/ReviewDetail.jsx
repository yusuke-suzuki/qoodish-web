import React, { Component } from 'react';
import Typography from 'material-ui/Typography';
import ReviewCardContainer from '../containers/ReviewCardContainer';
import { CircularProgress } from 'material-ui/Progress';
import RateReviewIcon from 'material-ui-icons/RateReview';
import EditReviewDialogContainer from '../containers/EditReviewDialogContainer';
import DeleteReviewDialogContainer from '../containers/DeleteReviewDialogContainer';
import Helmet from 'react-helmet';

const styles = {
  containerLarge: {
    margin: '94px auto 200px',
    width: '40%'
  },
  containerSmall: {
    margin: '56px auto 56px'
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
  async componentWillMount() {
    this.props.updatePageTitle();
    if (!this.props.currentReview) {
      await this.props.fetchReview();
    }
    gtag('config', process.env.GA_TRACKING_ID, {
      'page_path': `/maps/${this.props.currentReview.map_id}/reports/${this.props.currentReview.id}`,
      'page_title': `${this.props.currentReview.spot.name} - ${this.props.currentReview.map_name} | Qoodish`
    });
  }

  componentWillUnmount() {
    this.props.clear();
  }

  render() {
    return (
      <div
        style={this.props.large ? styles.containerLarge : styles.containerSmall}
      >
        {this.props.currentReview && this.renderHelmet(this.props.currentReview)}
        {this.props.reviewLoading
          ? this.renderProgress()
          : this.renderReviewCard()}
        <EditReviewDialogContainer mapId={this.props.match.params.mapId} />
        <DeleteReviewDialogContainer />
      </div>
    );
  }

  renderHelmet(review) {
    return (
      <Helmet
        title={`${review.spot.name} | Qoodish`}
        link={[
          { rel: "canonical", href: `${process.env.ENDPOINT}/maps/${review.map_id}/${review.id}` }
        ]}
        meta={[
          { name: 'title', content: `${review.spot.name} - ${review.map_name} | Qoodish` },
          { name: 'description', content: review.comment },
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:title', content: `${review.spot.name} - ${review.map_name} | Qoodish` },
          { name: 'twitter:description', content: review.comment },
          { name: 'twitter:image', content: review.image ? review.image.url : process.env.SUBSTITUTE_URL },
          { property: 'og:title', content: `${review.spot.name} - ${review.map_name} | Qoodish` },
          { property: 'og:type', content: 'website' },
          {
            property: 'og:url',
            content: `${process.env.ENDPOINT}/maps/${review.map_id}/${review.id}`
          },
          { property: 'og:image', content: review.image ? review.image.url : process.env.SUBSTITUTE_URL },
          {
            property: 'og:description',
            content: review.comment
          }
        ]}
      />
    );
  }

  renderReviewCard() {
    if (this.props.currentReview) {
      return (
        <ReviewCardContainer
          currentReview={this.props.currentReview}
          detail={!this.props.large}
        />
      );
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
        <Typography variant="subheading" color="inherit">
          Report not found.
        </Typography>
      </div>
    );
  }
}

export default ReviewDetail;
