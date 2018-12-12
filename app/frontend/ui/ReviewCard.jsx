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

const ReviewCardHeader = props => {
  return (
    <CardHeader
      avatar={
        <ButtonBase
          component={Link}
          to={`/users/${props.currentReview.author.id}`}
          title={props.currentReview.author.name}
        >
          <Avatar
            src={props.currentReview.author.profile_image_url}
            alt={props.currentReview.author.name}
          />
        </ButtonBase>
      }
      action={
        <div style={styles.actionContainer}>
          <ReviewShareMenuContainer currentReview={props.currentReview} />
          <ReviewVertMenuContainer currentReview={props.currentReview} />
        </div>
      }
      title={
        <ButtonBase
          component={Link}
          to={`/users/${props.currentReview.author.id}`}
          title={props.currentReview.author.name}
        >
          {props.currentReview.author.name}
        </ButtonBase>
      }
      subheader={createdAt(props.currentReview)}
    />
  );
};

const ReviewCardContent = props => {
  return (
    <CardContent style={styles.cardContent}>
      <ButtonBase
        component={Link}
        to={`/maps/${props.currentReview.map.id}`}
        title={props.currentReview.map.name}
      >
        <Typography
          variant="subtitle1"
          color="primary"
          style={styles.cardTitle}
          gutterBottom
        >
          {props.currentReview.map.name}
        </Typography>
      </ButtonBase>
      <br/>
      <ButtonBase
        component={Link}
        to={`/spots/${props.currentReview.spot.place_id}`}
        title={props.currentReview.spot.name}
      >
        <Typography
          variant="h5"
          component="h2"
          style={styles.cardTitle}
          gutterBottom
        >
          {props.currentReview.spot.name}
        </Typography>
      </ButtonBase>
      <Typography
        component="p"
        dangerouslySetInnerHTML={commentHtml(props.currentReview)}
        style={styles.reviewComment}
        data-test="review-card-comment"
      >
      </Typography>
    </CardContent>
  );
};

const ReviewCardMedia = props => {
  return (
    <CardMedia
      style={styles.cardMedia}
    >
      <img
        src={props.currentReview.image.url}
        style={styles.reviewImage}
        alt={props.currentReview.spot.name}
      />
    </CardMedia>
  );
};

const createdAt = review => {
  return moment(review.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ')
    .locale(window.currentLocale)
    .format('LL');
};

const commentHtml = review => {
  return {
    __html: twitter.autoLink(
      twitter.htmlEscape(review.comment),
      { targetBlank: true }
    )
  };
};

const ReviewCard = props => {
  return (
    <Card style={props.detail ? styles.cardDetail : styles.card}>
      <ReviewCardHeader {...props} />
      <ReviewCardContent {...props} />
      {props.currentReview.image ?
        <ReviewCardMedia {...props} /> :
        <Divider />
      }
      {props.currentReview.comments.length > 0 &&
        <ReviewCommentsContainer
          comments={props.currentReview.comments}
        />
      }
      <CardActions
        disableActionSpacing
        style={styles.cardActions}
      >
        <ReviewCardActionsContainer
          review={props.currentReview}
        />
      </CardActions>
    </Card>
  );
};

export default ReviewCard;
