import {
  Avatar,
  GridListTileBar,
  makeStyles,
  Typography
} from '@material-ui/core';
import { memo, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'redux-react-hook';
import openSpotCard from '../../actions/openSpotCard';
import selectMapSpot from '../../actions/selectMapSpot';
import ReviewsApi from '@yusuke-suzuki/qoodish-api-js-client/dist/api/ReviewsApi';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles({
  tileBar: {
    height: '50%'
  },
  reviewerContainer: {
    display: 'flex',
    position: 'absolute',
    zIndex: 1,
    right: 18,
    top: 8
  },
  reviewerAvatar: {
    width: 24,
    height: 24,
    marginRight: -10.66666667,
    borderColor: '#fff',
    backgroundColor: '#fff',
    borderRadius: '50%',
    borderStyle: 'solid',
    float: 'right',
    borderWidth: 1,
    cursor: 'pointer'
  },
  spotImage: {
    width: '100%',
    objectFit: 'cover',
    height: 100
  }
});

type Props = {
  spot: any;
};

export default memo(function SpotTile(props: Props) {
  const { spot } = props;
  const [reviews, setReviews] = useState([]);
  const dispatch = useDispatch();

  const classes = useStyles();
  const { I18n } = useLocale();

  const handleSpotClick = useCallback(
    spot => {
      dispatch(selectMapSpot(spot));
      dispatch(openSpotCard());
    },
    [dispatch, spot]
  );

  const initSpotReviews = useCallback(async () => {
    const apiInstance = new ReviewsApi();

    apiInstance.mapsMapIdSpotsPlaceIdReviewsGet(
      spot.map_id,
      spot.place_id,
      (error, data, response) => {
        if (response.ok) {
          setReviews(response.body);
        }
      }
    );
  }, [spot]);

  useEffect(() => {
    if (spot) {
      initSpotReviews();
    }
  }, [spot]);

  return (
    <div onClick={() => handleSpotClick(spot)}>
      <div className={classes.reviewerContainer}>
        {reviews.slice(0, 3).map(review => (
          <>
            {review.author.profile_image_url ? (
              <Avatar
                key={review.author.id}
                src={review.author.profile_image_url}
                imgProps={{
                  alt: review.author.name,
                  loading: 'lazy'
                }}
                className={classes.reviewerAvatar}
              />
            ) : (
              <Avatar
                key={review.author.id}
                alt={review.author.name}
                className={classes.reviewerAvatar}
              >
                {review.author.name.slice(0, 1)}
              </Avatar>
            )}
          </>
        ))}
      </div>
      <img
        src={spot.thumbnail_url_400}
        alt={spot.name}
        loading="lazy"
        className={classes.spotImage}
      />
      <GridListTileBar
        className={classes.tileBar}
        title={
          <Typography variant="subtitle2" color="inherit" noWrap>
            {spot.name}
          </Typography>
        }
        subtitle={
          <Typography variant="caption" color="inherit" noWrap>
            {`${spot.reviews_count} ${I18n.t('reviews count')}`}
          </Typography>
        }
      />
    </div>
  );
});
