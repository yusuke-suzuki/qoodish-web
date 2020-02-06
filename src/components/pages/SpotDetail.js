import React, { useCallback, useEffect, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import CircularProgress from '@material-ui/core/CircularProgress';

import SpotCard from '../organisms/SpotCard';
import NoContents from '../molecules/NoContents';
import CreateResourceButton from '../molecules/CreateResourceButton';

import I18n from '../../utils/I18n';
import openToast from '../../actions/openToast';
import fetchSpot from '../../actions/fetchSpot';
import clearSpotState from '../../actions/clearSpotState';
import updateMetadata from '../../actions/updateMetadata';

import { SpotsApi } from '@yusuke-suzuki/qoodish-api-js-client';

const styles = {
  progress: {
    textAlign: 'center',
    paddingTop: 20
  }
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
      <SpotCard currentSpot={currentSpot} placeId={props.params.placeId} />
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
      props.params.placeId,
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
    if (!currentUser || !currentUser.uid) {
      return;
    }

    if (!currentSpot) {
      initSpot();
    }

    return () => {
      dispatch(clearSpotState());
    };
  }, [currentUser.uid]);

  useEffect(() => {
    if (!currentSpot) {
      return;
    }
    const metadata = {
      title: `${currentSpot.name} | Qoodish`,
      keywords: `${currentSpot.name}, Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip`,
      description: currentSpot.formatted_address,
      twitterCard: 'summary',
      image: currentSpot.thumbnail_url_800,
      url: `${process.env.ENDPOINT}/spots/${currentSpot.place_id}`
    };
    dispatch(updateMetadata(metadata));
  }, [currentSpot]);

  return (
    <div>
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
