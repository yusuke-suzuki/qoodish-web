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

import ReviewTiles from '../organisms/ReviewTiles';
import I18n from '../../utils/I18n';
import { ReviewsApi } from 'qoodish_api';
import GoogleMapsLink from '../molecules/GoogleMapsLink';

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
  const large = useMediaQuery('(min-width: 600px)');

  const [spotReviews, setSpotReviews] = useState([]);

  const { currentSpot } = props;

  const initSpotReviews = useCallback(async () => {
    const apiInstance = new ReviewsApi();

    apiInstance.spotsPlaceIdReviewsGet(
      props.placeId,
      (error, data, response) => {
        if (response.ok) {
          setSpotReviews(response.body);
        }
      }
    );
  });

  useEffect(() => {
    if (currentSpot) {
      initSpotReviews();
    }
  }, [currentSpot]);

  return (
    <Card elevation={0}>
      <CardMedia style={large ? styles.cardMediaLarge : styles.cardMediaSmall}>
        <a href={currentSpot.url} target="_blank">
          <img
            src={`${process.env.GOOGLE_STATIC_MAP_URL}&zoom=${17}&size=${
              large ? 700 : 400
            }x${large ? 250 : 200}&scale=${2}&center=${currentSpot.lat},${
              currentSpot.lng
            }&markers=size:mid%7Ccolor:red%7C${currentSpot.lat},${
              currentSpot.lng
            }`}
            style={styles.staticMapImage}
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
          <ReviewTiles
            reviews={spotReviews}
            spacing={large ? 16 : 4}
            cellHeight={large ? 140 : 100}
            showSubheader
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(SpotCard);
