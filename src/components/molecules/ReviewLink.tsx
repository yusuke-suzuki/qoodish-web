import { createStyles, makeStyles } from '@material-ui/core';
import React, { memo, useCallback } from 'react';
import { useDispatch } from 'redux-react-hook';
import openReviewDialog from '../../actions/openReviewDialog';

type Props = {
  review: any;
  children: any;
};

const useStyles = makeStyles(() =>
  createStyles({
    link: {
      textDecoration: 'none',
      color: 'inherit'
    }
  })
);

export default memo(function ReviewLink(props: Props) {
  const { review, children } = props;
  const dispatch = useDispatch();
  const classes = useStyles();

  const handleClick = useCallback(
    e => {
      e.preventDefault();
      dispatch(openReviewDialog(review));
    },
    [dispatch, review]
  );

  return (
    <a
      href={`/maps/${review.map.id}/reports/${review.id}`}
      title={review.spot.name}
      className={classes.link}
      onClick={handleClick}
    >
      {children}
    </a>
  );
});
