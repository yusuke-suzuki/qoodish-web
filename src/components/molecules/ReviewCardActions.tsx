import React, { useState, useCallback, useContext } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';

import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';
import PersonIcon from '@material-ui/icons/Person';
import Button from '@material-ui/core/Button';
import ReviewLikeActions from './ReviewLikeActions';

import editReview from '../../actions/editReview';
import openToast from '../../actions/openToast';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';
import I18n from '../../utils/I18n';
import {
  CommentsApi,
  InlineObject
} from '@yusuke-suzuki/qoodish-api-js-client';
import AuthContext from '../../context/AuthContext';
import { Box, createStyles, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    textField: {
      justifyContent: 'center',
      marginLeft: theme.spacing(2)
    },
    avatar: {
      width: theme.spacing(3),
      height: theme.spacing(3)
    }
  })
);

const UserAvatar = React.memo(() => {
  const profile = useMappedState(useCallback(state => state.app.profile, []));

  const { currentUser } = useContext(AuthContext);

  const classes = useStyles();

  if (!currentUser || currentUser.isAnonymous) {
    return (
      <Avatar className={classes.avatar}>
        <PersonIcon />
      </Avatar>
    );
  } else {
    return profile.thumbnail_url ? (
      <Avatar
        src={profile.thumbnail_url}
        imgProps={{
          alt: profile.name,
          loading: 'lazy'
        }}
        className={classes.avatar}
      />
    ) : (
      <Avatar className={classes.avatar}>
        {profile.name && profile.name.slice(0, 1)}
      </Avatar>
    );
  }
});

type ReviewCardChildrenProps = {
  review: any;
};

const ReviewCardActions = React.memo((props: ReviewCardChildrenProps) => {
  const { review } = props;
  const { currentUser } = useContext(AuthContext);
  const [commentFormActive, setCommentFormActive] = useState(false);
  const [comment, setComment] = useState(undefined);
  const [sending, setSending] = useState(false);

  const dispatch = useDispatch();

  const classes = useStyles();

  const handleSendCommentButtonClick = useCallback(async () => {
    if (currentUser.isAnonymous) {
      dispatch(openSignInRequiredDialog());
      return;
    }

    setSending(true);
    const apiInstance = new CommentsApi();
    const inlineObject = InlineObject.constructFromObject({
      comment: comment
    });

    apiInstance.reviewsReviewIdCommentsPost(
      review.id,
      inlineObject,
      (error, data, response) => {
        setCommentFormActive(false);
        setComment(undefined);
        setSending(false);

        if (response.ok) {
          dispatch(openToast(I18n.t('added comment')));
          dispatch(editReview(response.body));
        } else {
          dispatch(openToast(I18n.t('comment failed')));
        }
      }
    );
  }, [dispatch, currentUser, review, comment]);

  return (
    <Box width="100%">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
      >
        <Box display="flex" alignItems="center" width="100%">
          <UserAvatar />
          <TextField
            fullWidth
            placeholder={I18n.t('add comment')}
            InputProps={{
              disableUnderline: true
            }}
            className={classes.textField}
            onFocus={() => setCommentFormActive(true)}
            autoFocus={commentFormActive}
            multiline={commentFormActive}
            onChange={e => setComment(e.target.value)}
          />
        </Box>

        <Box display="flex" alignItems="center">
          {!commentFormActive && <ReviewLikeActions target={review} />}
        </Box>
      </Box>

      {commentFormActive && (
        <Box display="flex" justifyContent="flex-end" width="100%">
          <Button
            onClick={() => {
              setCommentFormActive(false);
              setComment(undefined);
            }}
          >
            {I18n.t('cancel')}
          </Button>
          <Button
            onClick={handleSendCommentButtonClick}
            color="primary"
            disabled={!comment || sending}
          >
            {I18n.t('post')}
          </Button>
        </Box>
      )}
    </Box>
  );
});

export default React.memo(ReviewCardActions);
