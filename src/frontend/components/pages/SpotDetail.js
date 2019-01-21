import React, { useCallback, useEffect, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import PlaceIcon from '@material-ui/icons/Place';
import CircularProgress from '@material-ui/core/CircularProgress';
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker
} from 'react-google-maps';
import Helmet from 'react-helmet';

import NoContents from '../molecules/NoContents';
import CreateResourceButton from '../molecules/CreateResourceButton';
import ReviewTiles from '../organisms/ReviewTiles';

import I18n from '../../utils/I18n';
import ApiClient from '../../utils/ApiClient';
import openToast from '../../actions/openToast';
import fetchSpot from '../../actions/fetchSpot';
import fetchSpotReviews from '../../actions/fetchSpotReviews';
import clearSpotState from '../../actions/clearSpotState';

const styles = {
  rootLarge: {
    margin: '94px auto 20px',
    maxWidth: 700
  },
  rootSmall: {
    marginTop: 56
  },
  cardMapContainerLarge: {
    minHeight: 300
  },
  cardMapContainerSmall: {
    minHeight: 200
  },
  mapWrapperLarge: {
    height: 300
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
  progress: {
    textAlign: 'center',
    paddingTop: 20
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

const SpotDetailHelmet = props => {
  const spot = props.spot;

  return (
    <Helmet
      title={`${spot.name} | Qoodish`}
      link={[
        {
          rel: 'canonical',
          href: `${process.env.ENDPOINT}/spots/${spot.place_id}`
        }
      ]}
      meta={[
        { name: 'title', content: `${spot.name} | Qoodish` },
        {
          name: 'keywords',
          content: `${
            spot.name
          }, Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip`
        },
        { name: 'description', content: spot.formatted_address },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: `${spot.name} | Qoodish` },
        { name: 'twitter:description', content: spot.formatted_address },
        { name: 'twitter:image', content: spot.image_url },
        { property: 'og:title', content: `${spot.name} | Qoodish` },
        { property: 'og:type', content: 'website' },
        {
          property: 'og:url',
          content: `${process.env.ENDPOINT}/spots/${spot.place_id}`
        },
        { property: 'og:image', content: spot.image_url },
        {
          property: 'og:description',
          content: spot.formatted_address
        }
      ]}
    />
  );
};

const SpotDetailContainer = props => {
  const mapState = useCallback(
    state => ({
      currentSpot: state.spotDetail.currentSpot
    }),
    []
  );
  const { currentSpot } = useMappedState(mapState);

  if (currentSpot) {
    return <SpotCard {...props} />;
  } else {
    return (
      <NoContents contentType="spot" message={I18n.t('place not found')} />
    );
  }
};

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
    let response = await client.fetchSpotReviews(props.match.params.placeId);
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

const SpotDetail = props => {
  const large = useMediaQuery('(min-width: 600px)');
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      currentSpot: state.spotDetail.currentSpot
    }),
    []
  );
  const { currentSpot } = useMappedState(mapState);

  const [loading, setLoading] = useState(true);

  const initSpot = useCallback(async () => {
    setLoading(true);
    const client = new ApiClient();
    let response = await client.fetchSpot(props.match.params.placeId);
    let json = await response.json();
    if (response.ok) {
      dispatch(fetchSpot(json));
    } else if (response.status == 401) {
      dispatch(openToast('Authenticate failed'));
    } else if (response.status == 404) {
      dispatch(openToast('Spot not found.'));
    } else {
      dispatch(openToast('Failed to fetch Spot.'));
    }
    setLoading(false);
  });

  useEffect(() => {
    if (!currentSpot) {
      initSpot();
    }

    return () => {
      dispatch(clearSpotState());
    };
  }, []);

  useEffect(
    () => {
      if (currentSpot) {
        gtag('config', process.env.GA_TRACKING_ID, {
          page_path: `/spots/${currentSpot.place_id}`,
          page_title: `${currentSpot.name} | Qoodish`
        });
      }
    },
    [currentSpot]
  );

  return (
    <div style={large ? styles.rootLarge : styles.rootSmall}>
      {currentSpot && <SpotDetailHelmet spot={currentSpot} />}
      <div>
        {loading ? (
          <div style={styles.progress}>
            <CircularProgress />
          </div>
        ) : (
          <SpotDetailContainer {...props} />
        )}
      </div>
      {currentSpot && <CreateResourceButton />}
    </div>
  );
};

export default React.memo(SpotDetail);
