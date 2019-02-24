import React, { useCallback, useEffect } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import PlaceIcon from '@material-ui/icons/Place';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker
} from 'react-google-maps';

import ReviewTiles from '../organisms/ReviewTiles';
import I18n from '../../utils/I18n';
import fetchSpotReviews from '../../actions/fetchSpotReviews';
import { ReviewsApi } from 'qoodish_api';
import initializeApiClient from '../../utils/initializeApiClient';

const styles = {
  cardMapContainerLarge: {
    minHeight: 250
  },
  cardMapContainerSmall: {
    minHeight: 200
  },
  mapWrapperLarge: {
    height: 250
  },
  mapWrapperSmall: {
    height: 200
  },
  mapContainer: {
    height: '100%'
  },
  cardLarge: {},
  cardSmall: {
    minHeight: 'calc(100vh - 56px)'
  },
  cardContent: {
    textAlign: 'center'
  },
  reviewTilesContainer: {
    marginTop: 16
  }
};

const GoogleMapContainer = withScriptjs(
  withGoogleMap(() => {
    const mapState = useCallback(
      state => ({
        currentSpot: state.spotDetail.currentSpot,
        defaultZoom: state.gMap.defaultZoom
      }),
      []
    );
    const { currentSpot, defaultZoom } = useMappedState(mapState);

    return (
      <GoogleMap
        defaultZoom={defaultZoom}
        options={{
          zoomControl: false,
          streetViewControl: false,
          scaleControl: false,
          mapTypeControl: false,
          gestureHandling: 'greedy'
        }}
        center={
          currentSpot &&
          new google.maps.LatLng(
            parseFloat(currentSpot.lat),
            parseFloat(currentSpot.lng)
          )
        }
      >
        <Marker
          position={
            currentSpot &&
            new google.maps.LatLng(
              parseFloat(currentSpot.lat),
              parseFloat(currentSpot.lng)
            )
          }
          defaultAnimation={2}
        />
      </GoogleMap>
    );
  })
);

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
              <TableRow>
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
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      currentSpot: state.spotDetail.currentSpot,
      spotReviews: state.spotDetail.spotReviews
    }),
    []
  );
  const { currentSpot, spotReviews } = useMappedState(mapState);

  const initSpotReviews = useCallback(async () => {
    await initializeApiClient();
    const apiInstance = new ReviewsApi();

    apiInstance.spotsPlaceIdReviewsGet(
      props.placeId,
      (error, data, response) => {
        if (response.ok) {
          dispatch(fetchSpotReviews(response.body));
        }
      }
    );
  });

  useEffect(
    () => {
      if (currentSpot) {
        initSpotReviews();
      }
    },
    [currentSpot]
  );

  return (
    <Card style={large ? styles.cardLarge : styles.cardSmall}>
      <div
        style={
          large ? styles.cardMapContainerLarge : styles.cardMapContainerSmall
        }
      >
        <GoogleMapContainer
          googleMapURL={process.env.GOOGLE_MAP_URL}
          containerElement={
            <div
              style={large ? styles.mapWrapperLarge : styles.mapWrapperSmall}
            />
          }
          mapElement={<div style={styles.mapContainer} />}
          loadingElement={<div style={{ height: '100%' }} />}
        />
      </div>
      <CardContent style={styles.cardContent}>
        <PlaceIcon />
        <Typography variant="h5">{currentSpot.name}</Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {currentSpot.formatted_address}
        </Typography>
        <div>
          <a href={currentSpot.url} target="_blank">
            {I18n.t('open in google maps')}
          </a>
        </div>
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
