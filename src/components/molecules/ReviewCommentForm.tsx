import { TextField } from '@material-ui/core';
import { useCallback, useState, useEffect, memo } from 'react';

import I18n from '../../utils/I18n';

const MAX_COMMENT_LENGTH = 500;

type Props = {
  onChange: Function;
  currentReview: any;
};

export default memo(function ReviewCommentForm(props: Props) {
  const { currentReview, onChange } = props;

  const [comment, setComment] = useState<string>(null);
  const [error, setError] = useState<string>(null);

  const handleCommentChange = useCallback(
    e => {
      const input = e.target.value;
      if (input) {
        if (input.length > MAX_COMMENT_LENGTH) {
          setError(I18n.t('max characters 500'));
        } else {
          setError(null);
        }
      } else {
        setError(I18n.t('comment is required'));
      }
      setComment(input);
    },
    [MAX_COMMENT_LENGTH]
  );

  useEffect(() => {
    onChange(comment);
  }, [comment]);

  useEffect(() => {
    if (currentReview) {
      setComment(currentReview.comment);
    }
  }, [currentReview]);

  return (
    <TextField
      label={I18n.t('comment')}
      onChange={handleCommentChange}
      error={error ? true : false}
      helperText={error}
      fullWidth
      value={comment}
      multiline
      required
      autoFocus
      rows="7"
      margin="normal"
      data-test="review-comment-input"
      variant="outlined"
    />
  );
});
