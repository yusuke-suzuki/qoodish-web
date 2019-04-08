import React, { useCallback } from 'react';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import I18n from '../../utils/I18n';
import { LikesApi } from 'qoodish_api';
import fetchLikes from '../../actions/fetchLikes';
import openLikesDialog from '../../actions/openLikesDialog';
import { useDispatch } from 'redux-react-hook';

const styles = {
  reactionsCount: {
    paddingBottom: 0,
    display: 'flex'
  },
  comment: {
    marginRight: 16
  },
  like: {
    cursor: 'pointer'
  }
};

const ReactionsCount = props => {
  const { review } = props;
  const dispatch = useDispatch();

  const handleLikesClick = useCallback(async () => {
    dispatch(openLikesDialog());
    const apiInstance = new LikesApi();

    apiInstance.reviewsReviewIdLikesGet(review.id, (error, data, response) => {
      if (response.ok) {
        dispatch(fetchLikes(response.body));
      }
    });
  });

  if (review.comments.length < 1 && review.likes_count < 1) {
    return null;
  }

  return (
    <CardContent style={styles.reactionsCount}>
      {review.comments.length > 0 && (
        <Typography
          variant="subtitle2"
          color="textSecondary"
          gutterBottom
          style={styles.comment}
        >
          {`${review.comments.length} ${I18n.t('comment count')}`}
        </Typography>
      )}
      {review.likes_count > 0 && (
        <Typography
          variant="subtitle2"
          color="textSecondary"
          gutterBottom
          style={styles.like}
          onClick={handleLikesClick}
        >
          {`${review.likes_count} ${I18n.t('likes count')}`}
        </Typography>
      )}
    </CardContent>
  );
};

export default React.memo(ReactionsCount);
