import React, { useCallback, useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';

import I18n from '../../utils/I18n';

const MAX_COMMENT_LENGTH = 500;

const ReviewCommentForm = props => {
  const { currentReview, onCommentChange } = props;
  const [currentComment, setCurrentComment] = useState(undefined);
  const [errorText, setErrorText] = useState(undefined);

  const initValue = useCallback(() => {
    if (currentReview) {
      setCurrentComment(currentReview.comment);
    }
  }, [currentReview]);

  const handleCommentChange = useCallback(e => {
    const input = e.target.value;
    if (input) {
      if (input.length > MAX_COMMENT_LENGTH) {
        setErrorText(I18n.t('max characters 500'));
      } else {
        setErrorText(undefined);
      }
    } else {
      setErrorText(I18n.t('comment is required'));
    }
    setCurrentComment(input);
  }, []);

  useEffect(() => {
    onCommentChange(currentComment, errorText);
  }, [currentComment, errorText]);

  useEffect(() => {
    initValue();
  }, [currentReview]);

  return (
    <TextField
      label={I18n.t('comment')}
      onChange={handleCommentChange}
      error={errorText ? true : false}
      helperText={errorText}
      fullWidth
      value={currentComment}
      multiline
      required
      autoFocus
      rows="7"
      margin="normal"
      data-test="review-comment-input"
    />
  );
};

export default React.memo(ReviewCommentForm);
