import React, { useCallback, useContext } from 'react';
import { useDispatch } from 'redux-react-hook';

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
import Link from 'next/link';

import editReview from '../../actions/editReview';
import openToast from '../../actions/openToast';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';

import { LikesApi } from '@yusuke-suzuki/qoodish-api-js-client';
import openLikesDialog from '../../actions/openLikesDialog';
import fetchLikes from '../../actions/fetchLikes';
import AuthContext from '../../context/AuthContext';
import { Box, createStyles, makeStyles, Theme } from '@material-ui/core';
import { formatDistanceToNow } from 'date-fns';
import { enUS, ja } from 'date-fns/locale';
import { useLocale } from '../../hooks/useLocale';
import { useRouter } from 'next/router';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
      marginRight: theme.spacing(1)
    }
  })
);

type CommentItemProps = {
  comment: any;
};

const LikeButton = React.memo((props: CommentItemProps) => {
  const dispatch = useDispatch();
  const { I18n } = useLocale();

  const { currentUser } = useContext(AuthContext);

  const { comment } = props;

  const likeComment = useCallback(
    async comment => {
      const apiInstance = new LikesApi();

      apiInstance.reviewsReviewIdCommentsCommentIdLikePost(
        comment.review_id,
        comment.id,
        (error, data, response) => {
          if (response.ok) {
            dispatch(editReview(response.body));
            dispatch(openToast(I18n.t('liked!')));
          } else {
            dispatch(openToast('Request failed.'));
          }
        }
      );
    },
    [dispatch, comment]
  );

  const unlikeComment = useCallback(
    async comment => {
      const apiInstance = new LikesApi();

      apiInstance.reviewsReviewIdCommentsCommentIdLikeDelete(
        comment.review_id,
        comment.id,
        (error, data, response) => {
          if (response.ok) {
            dispatch(editReview(response.body));
            dispatch(openToast(I18n.t('unliked')));
          } else {
            dispatch(openToast('Request failed.'));
          }
        }
      );
    },
    [dispatch, comment]
  );

  const handleLikeCommentClick = useCallback(async () => {
    if (currentUser.isAnonymous) {
      dispatch(openSignInRequiredDialog());
      return;
    }
    comment.liked ? unlikeComment(comment) : likeComment(comment);
  }, [dispatch, currentUser, comment]);

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

type Props = {
  comments: any;
};

const Comments = React.memo((props: Props) => {
  const { comments } = props;
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLikesClick = useCallback(
    async comment => {
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
    },
    [dispatch]
  );

  const classes = useStyles();

  return comments.map(comment => (
    <ListItem key={comment.id}>
      <Link href={`/users/${comment.author.id}`} passHref>
        <ButtonBase title={comment.author.name}>
          <ListItemAvatar>
            <Avatar
              src={comment.author.profile_image_url}
              imgProps={{
                alt: comment.author.name,
                loading: 'lazy'
              }}
            />
          </ListItemAvatar>
        </ButtonBase>
      </Link>
      <ListItemText
        primary={
          <Box display="flex">
            <Typography color="textPrimary" noWrap>
              {comment.author.name}
            </Typography>
            <Typography
              color="textSecondary"
              variant="body2"
              className={classes.fromNow}
            >
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: router.locale === 'ja' ? ja : enUS
              })}
            </Typography>
          </Box>
        }
        secondary={
          <>
            <Typography
              color="textPrimary"
              className={classes.commentBody}
              gutterBottom
            >
              {comment.body}
            </Typography>
            {comment.likes_count > 0 && (
              <Typography
                color="textSecondary"
                className={classes.commentLikes}
                onClick={() => handleLikesClick(comment)}
              >
                <FavoriteIcon
                  fontSize="small"
                  className={classes.commentLikesIcon}
                />{' '}
                {comment.likes_count}
              </Typography>
            )}
          </>
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
