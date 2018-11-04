import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import PersonIcon from '@material-ui/icons/Person';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import I18n from '../containers/I18n';
import ReviewCardContainer from '../containers/ReviewCardContainer';
import NoContentsContainer from '../containers/NoContentsContainer';
import CreateReviewButtonContainer from '../containers/CreateReviewButtonContainer';

const styles = {
  rootLarge: {
    margin: '94px auto 200px',
    maxWidth: 700
  },
  rootSmall: {
    margin: '56px auto 56px',
    width: '100%'
  },
  formCardLarge: {
    marginTop: 84,
    cursor: 'pointer'
  },
  formCardSmall: {
    marginTop: 72,
    cursor: 'pointer'
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

export default class Feed extends React.PureComponent {
  componentDidMount() {
    this.props.updatePageTitle();
    if (!this.props.currentUser.isAnonymous) {
      this.props.refreshReviews();
    }
    gtag('config', process.env.GA_TRACKING_ID, {
      'page_path': '/',
      'page_title': `${I18n.t('home')} | Qoodish`
    });
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
          variant="contained"
          onClick={() => this.props.loadMoreReviews(this.props.nextTimestamp)}
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
        onClick={() => this.props.handleCreateReviewClick(this.props.currentUser)}
      >
        <CardHeader
          avatar={this.renderAvatar()}
          title={
            <Typography variant="body1" color="textSecondary">
              {I18n.t('share recent spot')}
            </Typography>
          }
        />
      </Card>
    );
  }

  renderAvatar() {
    if (this.props.currentUser.isAnonymous) {
      return (
        <Avatar>
          <PersonIcon />
        </Avatar>
      );
    } else {
      return (
        <Avatar
          src={this.props.currentUser.thumbnail_url}
          alt={this.props.currentUser.name}
        />
      );
    }
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
          secondaryAction="discover-reviews"
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
