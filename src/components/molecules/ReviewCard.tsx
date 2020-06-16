import React from 'react';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import moment from 'moment';
import ButtonBase from '@material-ui/core/ButtonBase';
import Divider from '@material-ui/core/Divider';
import twitter from 'twitter-text';
import { Link } from '@yusuke-suzuki/rize-router';
import ReviewShareMenu from './ReviewShareMenu';
import ReviewVertMenu from './ReviewVertMenu';
import ReviewCardActions from './ReviewCardActions';
import ReviewComments from './ReviewComments';
import I18n from '../../utils/I18n';
import ReviewImageStepper from './ReviewImageStepper';

const styles = {
  cardTitle: {
    width: 'fit-content',
    wordBreak: 'break-all'
  },
  reviewComment: {
    wordBreak: 'break-all',
    whiteSpace: 'pre-wrap'
  },
  cardContent: {
    paddingTop: 0
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
  const { currentReview } = props;

  return (
    <CardHeader
      avatar={
        <ButtonBase
          component={Link}
          to={`/users/${currentReview.author.id}`}
          title={currentReview.author.name}
        >
          <Avatar
            src={currentReview.author.profile_image_url}
            alt={currentReview.author.name}
            loading="lazy"
          />
        </ButtonBase>
      }
      action={
        <div style={styles.action}>
          <ReviewShareMenu currentReview={currentReview} />
          <ReviewVertMenu currentReview={currentReview} />
        </div>
      }
      title={
        <ButtonBase
          component={Link}
          to={`/users/${currentReview.author.id}`}
          title={currentReview.author.name}
        >
          {currentReview.author.name}
        </ButtonBase>
      }
      subheader={createdAt(currentReview)}
    />
  );
});

const ReviewCardContent = React.memo(props => {
  const { currentReview } = props;

  return (
    <CardContent style={styles.cardContent}>
      <ButtonBase
        component={Link}
        to={`/maps/${currentReview.map.id}`}
        title={currentReview.map.name}
      >
        <Typography
          variant="subtitle1"
          color="primary"
          style={styles.cardTitle}
          gutterBottom
        >
          {currentReview.map.name}
        </Typography>
      </ButtonBase>
      <br />
      <ButtonBase
        component={Link}
        to={{
          pathname: `/spots/${currentReview.spot.place_id}`,
          state: { modal: true, spot: currentReview.spot }
        }}
        title={currentReview.spot.name}
      >
        <Typography
          variant="h5"
          component="h2"
          style={styles.cardTitle}
          gutterBottom
        >
          {currentReview.spot.name}
        </Typography>
      </ButtonBase>
      <Typography
        component="p"
        dangerouslySetInnerHTML={commentHtml(currentReview)}
        style={styles.reviewComment}
        data-test="review-card-comment"
      />
    </CardContent>
  );
});

const createdAt = review => {
  return moment(review.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ')
    .locale(I18n.locale)
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
  const { currentReview } = props;

  return (
    <Card elevation={0}>
      <ReviewCardHeader currentReview={currentReview} />
      <ReviewCardContent currentReview={currentReview} />
      {currentReview.images.length > 0 ? (
        <ReviewImageStepper review={currentReview} />
      ) : (
        <Divider />
      )}
      {props.currentReview.comments.length > 0 && (
        <ReviewComments comments={currentReview.comments} />
      )}
      {props.hideActions ? null : (
        <CardActions disableSpacing style={styles.cardActions}>
          <ReviewCardActions review={currentReview} />
        </CardActions>
      )}
    </Card>
  );
};

export default React.memo(ReviewCard);
