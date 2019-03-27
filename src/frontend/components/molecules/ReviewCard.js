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
import Link from './Link';
import ReviewShareMenu from './ReviewShareMenu';
import ReviewVertMenu from './ReviewVertMenu';
import ReviewCardActions from './ReviewCardActions';
import ReviewComments from './ReviewComments';
import ReactionsCount from './ReactionsCount';

const styles = {
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
  action: {
    display: 'flex'
  },
  cardActions: {
    paddingLeft: 24,
    paddingRight: 16
  }
};

const ReviewCardHeader = React.memo(props => {
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
        <div style={styles.action}>
          <ReviewShareMenu currentReview={props.currentReview} />
          <ReviewVertMenu currentReview={props.currentReview} />
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
});

const ReviewCardContent = React.memo(props => {
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
      <br />
      <ButtonBase
        component={Link}
        to={{
          pathname: `/spots/${props.currentReview.spot.place_id}`,
          state: { modal: true, spot: props.currentReview.spot }
        }}
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
      />
    </CardContent>
  );
});

const ReviewCardMedia = React.memo(props => {
  return (
    <CardMedia style={styles.cardMedia}>
      <img
        src={props.currentReview.image.url}
        style={styles.reviewImage}
        alt={props.currentReview.spot.name}
      />
    </CardMedia>
  );
});

const createdAt = review => {
  return moment(review.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ')
    .locale(window.currentLocale)
    .format('LL');
};

const commentHtml = review => {
  return {
    __html: twitter.autoLink(twitter.htmlEscape(review.comment), {
      targetBlank: true
    })
  };
};

const ReviewCard = props => {
  return (
    <Card elevation={0}>
      <ReviewCardHeader {...props} />
      <ReviewCardContent {...props} />
      {props.currentReview.image ? <ReviewCardMedia {...props} /> : <Divider />}
      <ReactionsCount review={props.currentReview} />
      {props.currentReview.comments.length > 0 && (
        <ReviewComments comments={props.currentReview.comments} />
      )}
      {props.hideActions ? null : (
        <CardActions disableActionSpacing style={styles.cardActions}>
          <ReviewCardActions review={props.currentReview} />
        </CardActions>
      )}
    </Card>
  );
};

export default React.memo(ReviewCard);
