import React, { useCallback, useEffect, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import CircularProgress from '@material-ui/core/CircularProgress';
import Helmet from 'react-helmet';

import SpotCard from '../organisms/SpotCard';
import NoContents from '../molecules/NoContents';
import CreateResourceButton from '../molecules/CreateResourceButton';

import I18n from '../../utils/I18n';
import openToast from '../../actions/openToast';
import fetchSpot from '../../actions/fetchSpot';
import clearSpotState from '../../actions/clearSpotState';
import { SpotsApi } from 'qoodish_api';

const styles = {
  progress: {
    textAlign: 'center',
    paddingTop: 20
  }
};

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
    return (
      <SpotCard currentSpot={currentSpot} placeId={props.params.primaryId} />
    );
  } else {
    return (
      <NoContents contentType="spot" message={I18n.t('place not found')} />
    );
  }
};

const SpotDetail = props => {
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      currentSpot: state.spotDetail.currentSpot,
      currentUser: state.app.currentUser
    }),
    []
  );
  const { currentSpot, currentUser } = useMappedState(mapState);

  const [loading, setLoading] = useState(true);

  const initSpot = useCallback(async () => {
    setLoading(true);
    const apiInstance = new SpotsApi();

    apiInstance.spotsPlaceIdGet(
      props.params.primaryId,
      (error, data, response) => {
        setLoading(false);
        if (response.ok) {
          dispatch(fetchSpot(response.body));
        } else if (response.status == 401) {
          dispatch(openToast('Authenticate failed'));
        } else if (response.status == 404) {
          dispatch(openToast('Spot not found.'));
        } else {
          dispatch(openToast('Failed to fetch Spot.'));
        }
      }
    );
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
      if (!currentUser || !currentUser.uid) {
        return;
      }

      if (!currentSpot) {
        initSpot();
      }

      return () => {
        dispatch(clearSpotState());
      };
    },
    [currentUser.uid]
  );

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
    <div>
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
