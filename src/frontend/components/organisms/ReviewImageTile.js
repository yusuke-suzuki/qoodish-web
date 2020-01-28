import React from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import PlaceIcon from '@material-ui/icons/Place';

import { Link } from '@yusuke-suzuki/rize-router';
import { ButtonBase } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';

const styles = {
  reviewTile: {
    cursor: 'pointer',
    width: '100%',
    height: '100%'
  },
  reviewImage: {
    width: '100%'
  },
  placeIconLarge: {
    fontSize: 64,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translateY(-50%) translateX(-50%)'
  },
  placeIconSmall: {
    fontSize: 36,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translateY(-50%) translateX(-50%)'
  },
  skeleton: {
    width: '100%',
    height: '100%',
    textAlign: 'center'
  }
};

const ReviewImageTile = props => {
  const { review } = props;
  const large = useMediaQuery('(min-width: 600px)');

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
      {review.image ? (
        <img
          src={review.image.thumbnail_url_400}
          alt={review.spot.name}
          loading="lazy"
          style={styles.reviewImage}
        />
      ) : (
        <Skeleton variant="rect" style={styles.skeleton} animation={false}>
          <PlaceIcon
            style={large ? styles.placeIconLarge : styles.placeIconSmall}
            color="disabled"
          />
        </Skeleton>
      )}
    </ButtonBase>
  );
};

export default React.memo(ReviewImageTile);
