import React from 'react';

import { Link } from '@yusuke-suzuki/rize-router';
import { ButtonBase } from '@material-ui/core';

const styles = {
  reviewTile: {
    cursor: 'pointer',
    width: '100%',
    height: '100%'
  },
  reviewImage: {
    width: '100%'
  }
};

const ReviewImageTile = props => {
  const { review } = props;

  return (
    <ButtonBase
      key={review.id}
      style={styles.reviewTile}
      component={Link}
      to={{
        pathname: `/maps/${review.map.id}/reports/${review.id}`,
        state: { modal: true, review: review }
      }}
      title={review.spot.name}
    >
      <img
        src={
          review.images.length > 0
            ? review.images[0].thumbnail_url_400
            : process.env.NO_IMAGE
        }
        alt={review.spot.name}
        loading="lazy"
        style={styles.reviewImage}
      />
    </ButtonBase>
  );
};

export default React.memo(ReviewImageTile);
