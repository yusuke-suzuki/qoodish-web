import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';
import Button from '@material-ui/core/Button';
import CommentMenu from './CommentMenu';
import Link from './Link';

import I18n from '../../utils/I18n';
import ApiClient from '../../utils/ApiClient';
import editReview from '../../actions/editReview';
import openToast from '../../actions/openToast';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';

import moment from 'moment';

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
  likeButton: {
    marginTop: 6,
    padding: 0,
    minWidth: 'auto'
  }
};

const fromNow = comment => {
  return moment(comment.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ')
    .locale(window.currentLocale)
    .fromNow();
};

const Comments = props => {
  const dispatch = useDispatch();
  const currentUser = useMappedState(
    useCallback(state => state.app.currentUser, [])
  );

  const handleLikeCommentClick = useCallback(async comment => {
    if (currentUser.isAnonymous) {
      dispatch(openSignInRequiredDialog());
      return;
    }
    const client = new ApiClient();
    let response;
    if (comment.liked) {
      response = await client.unlikeComment(comment.review_id, comment.id);
    } else {
      response = await client.likeComment(comment.review_id, comment.id);
    }
    if (response.ok) {
      let review = await response.json();
      dispatch(editReview(review));
      dispatch(openToast(I18n.t(comment.liked ? 'unliked' : 'liked!')));

      gtag('event', comment.liked ? 'unlike' : 'like', {
        event_category: 'engagement',
        event_label: 'review'
      });
    } else {
      dispatch(openToast('Request failed.'));
    }
  });

  return props.comments.map(comment => (
    <ListItem key={comment.id}>
      <ButtonBase
        component={Link}
        to={`/users/${comment.author.id}`}
        title={comment.author.name}
      >
        <Avatar
          src={comment.author.profile_image_url}
          alt={comment.author.name}
        />
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
          <div>
            <Typography color="textPrimary" style={styles.commentBody}>
              {comment.body}
            </Typography>
            <Button
              style={styles.likeButton}
              color={comment.liked ? 'primary' : 'default'}
              onClick={() => handleLikeCommentClick(comment)}
            >
              {I18n.t('like!')}
            </Button>
          </div>
        }
      />
      <ListItemSecondaryAction>
        <CommentMenu comment={comment} />
      </ListItemSecondaryAction>
    </ListItem>
  ));
};

const ReviewComments = props => {
  return (
    <List
      disablePadding
      subheader={
        <ListSubheader>{`${props.comments.length} ${I18n.t(
          'comment count'
        )}`}</ListSubheader>
      }
    >
      <Comments {...props} />
    </List>
  );
};

export default React.memo(ReviewComments);
