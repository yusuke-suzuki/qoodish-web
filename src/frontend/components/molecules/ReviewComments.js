import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';
import IconButton from '@material-ui/core/IconButton';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';

import CommentMenu from './CommentMenu';
import Link from './Link';

import I18n from '../../utils/I18n';
import editReview from '../../actions/editReview';
import openToast from '../../actions/openToast';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';

import moment from 'moment';
import { LikesApi } from 'qoodish_api';
import openLikesDialog from '../../actions/openLikesDialog';
import fetchLikes from '../../actions/fetchLikes';

const styles = {
  primaryText: {
    display: 'flex'
  },
  fromNow: {
    marginLeft: 'auto'
  },
  commentBody: {
    wordBreak: 'break-all'
  },
  commentLikes: {
    display: 'flex',
    cursor: 'pointer'
  },
  commentLikesIcon: {
    marginRight: 8
  }
};

const fromNow = comment => {
  return moment(comment.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ')
    .locale(window.currentLocale)
    .fromNow();
};

const LikeButton = React.memo(props => {
  const dispatch = useDispatch();
  const currentUser = useMappedState(
    useCallback(state => state.app.currentUser, [])
  );

  const comment = props.comment;

  const likeComment = useCallback(async comment => {
    const apiInstance = new LikesApi();

    apiInstance.reviewsReviewIdCommentsCommentIdLikePost(
      comment.review_id,
      comment.id,
      (error, data, response) => {
        if (response.ok) {
          dispatch(editReview(response.body));
          dispatch(openToast(I18n.t('liked!')));

          gtag('event', 'like', {
            event_category: 'engagement',
            event_label: 'review'
          });
        } else {
          dispatch(openToast('Request failed.'));
        }
      }
    );
  });

  const unlikeComment = useCallback(async comment => {
    const apiInstance = new LikesApi();

    apiInstance.reviewsReviewIdCommentsCommentIdLikeDelete(
      comment.review_id,
      comment.id,
      (error, data, response) => {
        if (response.ok) {
          dispatch(editReview(response.body));
          dispatch(openToast(I18n.t('unliked')));

          gtag('event', 'unlike', {
            event_category: 'engagement',
            event_label: 'review'
          });
        } else {
          dispatch(openToast('Request failed.'));
        }
      }
    );
  });

  const handleLikeCommentClick = useCallback(async () => {
    if (currentUser.isAnonymous) {
      dispatch(openSignInRequiredDialog());
      return;
    }
    comment.liked ? unlikeComment(comment) : likeComment(comment);
  });

  return (
    <IconButton onClick={handleLikeCommentClick}>
      {comment.liked ? (
        <FavoriteIcon color="error" fontSize="small" />
      ) : (
        <FavoriteBorderIcon fontSize="small" />
      )}
    </IconButton>
  );
});

const Comments = React.memo(props => {
  const dispatch = useDispatch();

  const handleLikesClick = useCallback(async comment => {
    dispatch(openLikesDialog());
    const apiInstance = new LikesApi();

    apiInstance.reviewsReviewIdCommentsCommentIdLikesGet(
      comment.review_id,
      comment.id,
      (error, data, response) => {
        if (response.ok) {
          dispatch(fetchLikes(response.body));
        }
      }
    );
  });

  return props.comments.map(comment => (
    <ListItem key={comment.id}>
      <ButtonBase
        component={Link}
        to={`/users/${comment.author.id}`}
        title={comment.author.name}
      >
        <ListItemAvatar>
          <Avatar
            src={comment.author.profile_image_url}
            alt={comment.author.name}
          />
        </ListItemAvatar>
      </ButtonBase>
      <ListItemText
        primary={
          <div style={styles.primaryText}>
            <Typography color="textPrimary" noWrap>
              {comment.author.name}
            </Typography>
            <Typography
              color="textSecondary"
              variant="body2"
              style={styles.fromNow}
            >
              {fromNow(comment)}
            </Typography>
          </div>
        }
        secondary={
          <React.Fragment>
            <Typography
              color="textPrimary"
              style={styles.commentBody}
              gutterBottom
            >
              {comment.body}
            </Typography>
            {comment.likes_count > 0 && (
              <Typography
                color="textSecondary"
                style={styles.commentLikes}
                onClick={() => handleLikesClick(comment)}
              >
                <FavoriteIcon
                  fontSize="small"
                  style={styles.commentLikesIcon}
                />{' '}
                {comment.likes_count}
              </Typography>
            )}
          </React.Fragment>
        }
      />
      <ListItemSecondaryAction>
        {comment.editable ? (
          <CommentMenu comment={comment} />
        ) : (
          <LikeButton comment={comment} />
        )}
      </ListItemSecondaryAction>
    </ListItem>
  ));
});

const ReviewComments = props => {
  return (
    <List disablePadding>
      <Comments {...props} />
    </List>
  );
};

export default React.memo(ReviewComments);
