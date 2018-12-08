import React from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import moment from 'moment';
import ButtonBase from '@material-ui/core/ButtonBase';
import Divider from '@material-ui/core/Divider';
import twitter from 'twitter-text';
import { Link } from 'react-router-dom';
import ReviewShareMenuContainer from '../containers/ReviewShareMenuContainer';
import ReviewVertMenuContainer from '../containers/ReviewVertMenuContainer';
import ReviewCardActionsContainer from '../containers/ReviewCardActionsContainer';
import ReviewCommentsContainer from '../containers/ReviewCommentsContainer';

const styles = {
  cardDetail: {
    minHeight: 'calc(100vh - 56px)'
  },
  cardTitle: {
    width: 'fit-content',
    wordBreak: 'break-all'
  },
  reviewComment: {
    wordBreak: 'break-all'
  },
  cardContent: {
    paddingTop: 0
  },
  cardMedia: {
    marginBottom: -5
  },
  reviewImage: {
    width: '100%'
  },
  actionContainer: {
    display: 'flex'
  },
  cardActions: {
    paddingLeft: 24
  }
};

class ReviewCard extends React.PureComponent {
  render() {
    return (
      <div>
        {this.renderReviewCard(this.props.currentReview)}
      </div>
    );
  }

  renderReviewCard(review) {
    const commentHtml = {
      __html: twitter.autoLink(
        twitter.htmlEscape(review.comment),
        { targetBlank: true }
      )
    };

    return (
      <Card style={this.props.detail ? styles.cardDetail : styles.card}>
        <CardHeader
          avatar={
            <ButtonBase
              component={Link}
              to={`/users/${review.author.id}`}
              title={review.author.name}
            >
              <Avatar
                src={review.author.profile_image_url}
                alt={review.author.name}
              />
            </ButtonBase>
          }
          action={
            <div style={styles.actionContainer}>
              <ReviewShareMenuContainer currentReview={review} />
              <ReviewVertMenuContainer currentReview={review} />
            </div>
          }
          title={
            <ButtonBase
              component={Link}
              to={`/users/${review.author.id}`}
              title={review.author.name}
            >
              {review.author.name}
            </ButtonBase>
          }
          subheader={this.renderCreatedAt(review)}
        />
        <CardContent style={styles.cardContent}>
          <ButtonBase
            component={Link}
            to={`/maps/${review.map.id}`}
            title={review.map.name}
          >
            <Typography
              variant="subtitle1"
              color="primary"
              style={styles.cardTitle}
              gutterBottom
            >
              {review.map.name}
            </Typography>
          </ButtonBase>
          <br/>
          <ButtonBase
            component={Link}
            to={`/spots/${review.spot.place_id}`}
            title={review.spot.name}
          >
            <Typography
              variant="h5"
              component="h2"
              style={styles.cardTitle}
              gutterBottom
            >
              {review.spot.name}
            </Typography>
          </ButtonBase>
          <Typography
            component="p"
            dangerouslySetInnerHTML={commentHtml}
            style={styles.reviewComment}
            data-test="review-card-comment"
          >
          </Typography>
        </CardContent>
        {review.image ? this.renderCardMedia(review) : <Divider />}
        {review.comments.length > 0 && <ReviewCommentsContainer review={review} />}
        <CardActions disableActionSpacing style={styles.cardActions}>
          <ReviewCardActionsContainer review={review} />
        </CardActions>
      </Card>
    );
  }

  renderCreatedAt(review) {
    return moment(review.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ')
      .locale(window.currentLocale)
      .format('LL');
  }

  renderCardMedia(review) {
    return (
      <CardMedia
        style={styles.cardMedia}
      >
        <img
          src={review.image.url}
          style={styles.reviewImage}
          alt={review.spot.name}
        />
      </CardMedia>
    );
  }
}

export default ReviewCard;
