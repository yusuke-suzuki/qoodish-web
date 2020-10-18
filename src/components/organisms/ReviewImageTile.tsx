import { createStyles, makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import ReviewLink from '../molecules/ReviewLink';

const useStyles = makeStyles(() =>
  createStyles({
    reviewImage: {
      width: '100%'
    }
  })
);

type Props = {
  review: any;
};

export default memo(function ReviewImageTile(props: Props) {
  const { review } = props;
  const classes = useStyles();

  return (
    <ReviewLink review={review}>
      <img
        src={
          review.images.length > 0
            ? review.images[0].thumbnail_url_400
            : process.env.NEXT_PUBLIC_NO_IMAGE
        }
        alt={review.spot.name}
        loading="lazy"
        className={classes.reviewImage}
      />
    </ReviewLink>
  );
});
