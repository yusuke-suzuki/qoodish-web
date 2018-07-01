import React, { Component } from 'react';
import { CircularProgress } from 'material-ui/Progress';
import Typography from 'material-ui/Typography';
import Avatar from 'material-ui/Avatar';
import Button from 'material-ui/Button';
import ReviewCardContainer from '../containers/ReviewCardContainer';
import Card, { CardHeader } from 'material-ui/Card';
import I18n from '../containers/I18n';
import NoContentsContainer from '../containers/NoContentsContainer';
import CreateReviewButtonContainer from '../containers/CreateReviewButtonContainer';

const styles = {
  rootLarge: {
    marginTop: 94,
    marginBottom: 200
  },
  rootSmall: {
    margin: '56px auto 56px',
    width: '100%'
  },
  formCardLarge: {
    marginTop: 84
  },
  formCardSmall: {
    marginTop: 72
  },
  container: {
    display: 'inline-block',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%'
  },
  buttonContainer: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16
  },
  progress: {
    textAlign: 'center',
    padding: 10,
    marginTop: 20
  },
  profileImage: {
    width: 40
  },
  cardContainerSmall: {
    marginTop: 16
  },
  cardContainerLarge: {
    marginTop: 20
  }
};

export default class Feed extends Component {
  constructor(props) {
    super(props);
    this.handleClickLoadMoreButton = this.handleClickLoadMoreButton.bind(this);
  }

  componentWillMount() {
    this.props.updatePageTitle();
    this.props.refreshReviews();

    gtag('config', process.env.GA_TRACKING_ID, {
      'page_path': '/',
      'page_title': 'Home | Qoodish'
    });
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
        <Button
          variant="raised"
          onClick={this.handleClickLoadMoreButton}
          style={
            this.props.large
              ? styles.raisedButtonLarge
              : styles.raisedButtonSmall
          }
        >
          {I18n.t('load more')}
        </Button>
      </div>
    );
  }

  render() {
    return (
      <div style={this.props.large ? styles.rootLarge : styles.rootSmall}>
        {this.renderCreateReviewForm()}
        <div style={styles.container}>
          {this.props.loadingReviews
            ? this.renderProgress()
            : this.renderReviewContainer(this.props.currentReviews)}
        </div>
        <CreateReviewButtonContainer buttonWithBottomSeat={!this.props.large} />
      </div>
    );
  }

  renderCreateReviewForm() {
    return (
      <Card
        style={this.props.large ? styles.formCardLarge : styles.formCardSmall}
        onClick={this.props.handleCreateReviewClick}
      >
        <CardHeader
          avatar={
            <Avatar
              src={
                this.props.currentUser ? this.props.currentUser.image_url : ''
              }
            />
          }
          title={
            <Typography variant="body2" color="textSecondary">
              {I18n.t('share recent spot')}
            </Typography>
          }
        />
      </Card>
    );
  }

  renderReviewContainer(reviews) {
    if (reviews.length > 0) {
      return (
        <div>
          {this.renderReviewCards(reviews)}
          {this.props.loadingMoreReviews
            ? this.renderProgress()
            : this.renderLoadMoreButton()}
        </div>
      );
    } else {
      return (
        <NoContentsContainer
          contentType="review"
          action="create-review"
          message={I18n.t('reports will see here')}
        />
      );
    }
  }

  renderReviewCards(reviews) {
    return reviews.map(review => (
      <div
        key={review.id}
        style={
          this.props.large
            ? styles.cardContainerLarge
            : styles.cardContainerSmall
        }
      >
        <ReviewCardContainer currentReview={review} />
      </div>
    ));
  }
}
