import React, { useCallback, useEffect } from 'react';
import {
  CardContent,
  Typography,
  Avatar,
  makeStyles,
  createStyles,
  Theme
} from '@material-ui/core';
import SpotImageStepper from './SpotImageStepper';
import { useMappedState, useDispatch } from 'redux-react-hook';
import GoogleMapsLink from './GoogleMapsLink';
import ReviewsApi from '@yusuke-suzuki/qoodish-api-js-client/dist/api/ReviewsApi';
import fetchMapSpotReviews from '../../actions/fetchMapSpotReviews';
import Skeleton from '@material-ui/lab/Skeleton';
import SpotLink from './SpotLink';
import ReviewLink from './ReviewLink';
import { AvatarGroup } from '@material-ui/lab';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 300
    },
    cardContent: {
      paddingBottom: theme.spacing(2)
    },
    cardActions: {
      padding: 12,
      paddingTop: 0
    },
    avatars: {
      marginBottom: theme.spacing(2)
    }
  })
);

const SpotInfoWindow = () => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { I18n } = useLocale();

  const mapState = useCallback(
    state => ({
      currentSpot: state.spotCard.currentSpot,
      spotReviews: state.spotCard.spotReviews
    }),
    []
  );
  const { currentSpot, spotReviews } = useMappedState(mapState);

  const initSpotReviews = useCallback(async () => {
    const apiInstance = new ReviewsApi();

    apiInstance.mapsMapIdSpotsPlaceIdReviewsGet(
      currentSpot.map_id,
      currentSpot.place_id,
      (error, data, response) => {
        if (response.ok) {
          dispatch(fetchMapSpotReviews(response.body));
        }
      }
    );
  }, [dispatch, currentSpot]);

  useEffect(() => {
    if (currentSpot.place_id) {
      initSpotReviews();
    }
  }, [currentSpot.place_id]);

  return (
    <div className={classes.root}>
      <SpotImageStepper spotReviews={spotReviews} currentSpot={currentSpot} />
      <CardContent className={classes.cardContent}>
        <SpotLink spot={currentSpot}>
          <Typography variant="h6" gutterBottom>
            {currentSpot.name}
          </Typography>
        </SpotLink>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          {currentSpot.formatted_address}
        </Typography>
        <Typography variant="subtitle2" gutterBottom color="textSecondary">
          {`${spotReviews.length} ${I18n.t('reviews count')}`}
        </Typography>
        <AvatarGroup max={9} className={classes.avatars}>
          {spotReviews.length < 1 && (
            <Skeleton variant="circle" width={40} height={40} />
          )}
          {spotReviews.map(review => (
            <ReviewLink review={review} key={review.id}>
              {review.author.profile_image_url ? (
                <Avatar
                  src={review.author.profile_image_url}
                  imgProps={{
                    alt: review.author.name,
                    loading: 'lazy'
                  }}
                />
              ) : (
                <Avatar alt={review.author.name}>
                  {review.author.name.slice(0, 1)}
                </Avatar>
              )}
            </ReviewLink>
          ))}
        </AvatarGroup>
        <GoogleMapsLink currentSpot={currentSpot} />
      </CardContent>
    </div>
  );
};

export default React.memo(SpotInfoWindow);
