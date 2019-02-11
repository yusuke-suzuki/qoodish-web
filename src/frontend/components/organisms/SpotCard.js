import React, { useCallback, useEffect } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import PlaceIcon from '@material-ui/icons/Place';
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker
} from 'react-google-maps';

import ReviewTiles from '../organisms/ReviewTiles';
import I18n from '../../utils/I18n';
import ApiClient from '../../utils/ApiClient';
import fetchSpotReviews from '../../actions/fetchSpotReviews';

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
  },
  urlContainer: {
    marginBottom: '0.35em'
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
    const client = new ApiClient();
    let response = await client.fetchSpotReviews(props.placeId);
    let json = await response.json();
    if (response.ok) {
      dispatch(fetchSpotReviews(json));
    }
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
        <div style={styles.urlContainer}>
          <a href={currentSpot.url} target="_blank">
            {I18n.t('open in google maps')}
          </a>
        </div>
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
