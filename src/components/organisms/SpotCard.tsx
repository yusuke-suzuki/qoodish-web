import React, { useCallback, useEffect, useState } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import PlaceIcon from '@material-ui/icons/Place';

import I18n from '../../utils/I18n';
import { ReviewsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import GoogleMapsLink from '../molecules/GoogleMapsLink';
import ReviewGridList from './ReviewGridList';
import ReviewImageTile from './ReviewImageTile';
import { useTheme, makeStyles, Theme, createStyles } from '@material-ui/core';
import OpeningHours from '../molecules/OpeningHours';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cardMedia: {
      cursor: 'pointer',
      height: 200,
      [theme.breakpoints.up('sm')]: {
        height: 250
      }
    },
    cardContent: {
      textAlign: 'center'
    },
    reviewTilesContainer: {
      marginTop: theme.spacing(2)
    },
    staticMapImage: {
      width: '100%',
      height: '100%'
    }
  })
);

type Props = {
  currentSpot: any;
  placeId: string;
};

const SpotCard = (props: Props) => {
  const classes = useStyles();
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const [spotReviews, setSpotReviews] = useState([]);

  const { currentSpot, placeId } = props;

  const initSpotReviews = useCallback(async () => {
    const apiInstance = new ReviewsApi();

    apiInstance.spotsPlaceIdReviewsGet(placeId, (error, data, response) => {
      if (response.ok) {
        setSpotReviews(response.body);
      }
    });
  }, [placeId]);

  useEffect(() => {
    if (currentSpot) {
      initSpotReviews();
    }
  }, [currentSpot]);

  return (
    <Card elevation={0}>
      <CardMedia className={classes.cardMedia}>
        <a href={currentSpot.url} target="_blank" rel="noopener">
          <img
            src={`${
              process.env.NEXT_PUBLIC_GOOGLE_STATIC_MAP_URL
            }&zoom=${17}&size=${smUp ? 700 : 400}x${
              smUp ? 250 : 200
            }&scale=${2}&center=${currentSpot.lat},${
              currentSpot.lng
            }&markers=size:mid%7Ccolor:red%7C${currentSpot.lat},${
              currentSpot.lng
            }`}
            className={classes.staticMapImage}
            loading="lazy"
          />
        </a>
      </CardMedia>
      <CardContent className={classes.cardContent}>
        <PlaceIcon />
        <Typography variant="h5">{currentSpot.name}</Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {currentSpot.formatted_address}
        </Typography>
        <GoogleMapsLink currentSpot={currentSpot} />
        <OpeningHours openingHours={currentSpot.opening_hours} />
        <div className={classes.reviewTilesContainer}>
          <Typography variant="subtitle2" gutterBottom color="textSecondary">
            {`${spotReviews.length} ${I18n.t('reviews count')}`}
          </Typography>
          <ReviewGridList spacing={smUp ? 16 : 4} cellHeight="auto">
            {spotReviews.map(review => (
              <ReviewImageTile review={review} key={review.id} />
            ))}
          </ReviewGridList>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(SpotCard);
