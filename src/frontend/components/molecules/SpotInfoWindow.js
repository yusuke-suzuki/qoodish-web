import React, { useCallback, useMemo } from 'react';
import {
  CardContent,
  Typography,
  ButtonBase,
  Avatar,
  Button,
  CardActions
} from '@material-ui/core';
import SpotImageStepper from './SpotImageStepper';
import { useMappedState, useDispatch } from 'redux-react-hook';
import I18n from '../../utils/I18n';
import Link from './Link';
import selectPlaceForReview from '../../actions/selectPlaceForReview';

const styles = {
  root: {
    width: 300
  },
  cardContent: {
    paddingBottom: 16
  },
  gmapLink: {
    textDecoration: 'none'
  },
  reviewerAvatar: {
    marginBottom: '0.35em',
    marginRight: -10.66666667,
    borderColor: '#fff',
    backgroundColor: '#fff',
    borderRadius: '50%',
    borderStyle: 'solid',
    float: 'right',
    borderWidth: 1,
    width: 32,
    height: 32
  },
  cardActions: {
    padding: 12,
    paddingTop: 0
  }
};

const SpotInfoWindow = () => {
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      currentSpot: state.spotCard.currentSpot,
      spotReviews: state.spotCard.spotReviews,
      currentMap: state.mapDetail.currentMap
    }),
    []
  );
  const { currentSpot, spotReviews, currentMap } = useMappedState(mapState);

  const handleCreateReviewClick = useCallback(() => {
    const place = {
      description: currentSpot.name,
      placeId: currentSpot.place_id
    };
    dispatch(selectPlaceForReview(place));
  });

  const reviewAlreadyExists = useMemo(
    () => {
      return spotReviews.some(review => {
        return review.place_id === currentSpot.place_id && review.editable;
      });
    },
    [spotReviews]
  );

  return (
    <div style={styles.root}>
      <SpotImageStepper spotReviews={spotReviews} currentSpot={currentSpot} />
      <CardContent style={styles.cardContent}>
        <ButtonBase
          component={Link}
          to={{
            pathname: currentSpot ? `/spots/${currentSpot.place_id}` : '',
            state: { modal: true, spot: currentSpot }
          }}
        >
          <Typography variant="h6" gutterBottom>
            {currentSpot && currentSpot.name}
          </Typography>
        </ButtonBase>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          {currentSpot && currentSpot.formatted_address}
        </Typography>
        <Typography variant="subtitle2" gutterBottom color="textSecondary">
          {`${spotReviews.length} ${I18n.t('reviews count')}`}
        </Typography>
        {spotReviews.map(review => (
          <ButtonBase
            key={review.id}
            component={Link}
            to={{
              pathname: `/maps/${review.map.id}/reports/${review.id}`,
              state: { modal: true, review: review }
            }}
          >
            <Avatar
              src={review.author.profile_image_url}
              alt={review.author.name}
              style={styles.reviewerAvatar}
            />
          </ButtonBase>
        ))}
        <Typography variant="subtitle2" color="textSecondary">
          <a
            href={currentSpot && currentSpot.url}
            target="_blank"
            style={styles.gmapLink}
          >
            {I18n.t('open in google maps')}
          </a>
        </Typography>
      </CardContent>
      {currentMap.postable && (
        <CardActions style={styles.cardActions}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleCreateReviewClick}
            disabled={reviewAlreadyExists}
          >
            {I18n.t('create new report')}
          </Button>
        </CardActions>
      )}
    </div>
  );
};

export default React.memo(SpotInfoWindow);
