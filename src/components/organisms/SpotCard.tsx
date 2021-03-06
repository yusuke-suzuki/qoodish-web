import React, { useCallback, useEffect, useState } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import PlaceIcon from '@material-ui/icons/Place';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import I18n from '../../utils/I18n';
import { ReviewsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import GoogleMapsLink from '../molecules/GoogleMapsLink';
import ReviewGridList from './ReviewGridList';
import ReviewImageTile from './ReviewImageTile';
import { useTheme } from '@material-ui/core';

const styles = {
  cardMediaLarge: {
    cursor: 'pointer',
    height: 250
  },
  cardMediaSmall: {
    cursor: 'pointer',
    height: 200
  },
  cardContent: {
    textAlign: 'center'
  },
  reviewTilesContainer: {
    marginTop: 16
  },
  staticMapImage: {
    width: '100%',
    height: '100%'
  }
};

const OpeningHours = React.memo(props => {
  let openingHours = JSON.parse(props.openingHours);
  if (!openingHours) {
    return null;
  }
  return (
    <div>
      <br />
      <Typography variant="subtitle2" color="textSecondary">
        {I18n.t('opening hours')}
      </Typography>
      <Table>
        <TableBody>
          {openingHours.weekday_text.map(weekday => {
            let [key, text] = weekday.split(': ');
            return (
              <TableRow key={key}>
                <TableCell>{key}</TableCell>
                <TableCell align="right">{text}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
});

const SpotCard = props => {
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
      <CardMedia style={smUp ? styles.cardMediaLarge : styles.cardMediaSmall}>
        <a href={currentSpot.url} target="_blank">
          <img
            src={`${process.env.GOOGLE_STATIC_MAP_URL}&zoom=${17}&size=${
              smUp ? 700 : 400
            }x${smUp ? 250 : 200}&scale=${2}&center=${currentSpot.lat},${
              currentSpot.lng
            }&markers=size:mid%7Ccolor:red%7C${currentSpot.lat},${
              currentSpot.lng
            }`}
            style={styles.staticMapImage}
            loading="lazy"
          />
        </a>
      </CardMedia>
      <CardContent style={styles.cardContent}>
        <PlaceIcon />
        <Typography variant="h5">{currentSpot.name}</Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {currentSpot.formatted_address}
        </Typography>
        <GoogleMapsLink currentSpot={currentSpot} />
        <OpeningHours openingHours={currentSpot.opening_hours} />
        <div style={styles.reviewTilesContainer}>
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
