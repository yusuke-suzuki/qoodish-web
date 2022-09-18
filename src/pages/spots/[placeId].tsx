import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import CircularProgress from '@material-ui/core/CircularProgress';

import openToast from '../../actions/openToast';
import fetchSpot from '../../actions/fetchSpot';

import { ApiClient, SpotsApi } from '@yusuke-suzuki/qoodish-api-js-client';
import AuthContext from '../../context/AuthContext';
import SpotCard from '../../components/organisms/SpotCard';
import NoContents from '../../components/molecules/NoContents';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Head from 'next/head';
import { makeStyles } from '@material-ui/core';
import {
  Client,
  Language,
  PlaceData
} from '@googlemaps/google-maps-services-js';
import { PrismaClient } from '@prisma/client';
import { useLocale } from '../../hooks/useLocale';
import { GetServerSideProps } from 'next';
import path from 'path';

const useStyles = makeStyles({
  progress: {
    textAlign: 'center',
    paddingTop: 20
  }
});

type Props = {
  placeData: PlaceData;
  thumbnailUrl: string;
};

const SpotDetail = (props: Props) => {
  const { placeData, thumbnailUrl } = props;

  const { I18n } = useLocale();

  const router = useRouter();
  const { placeId } = router.query;
  const dispatch = useDispatch();
  const classes = useStyles();

  const mapState = useCallback(
    state => ({
      currentSpot: state.spotDetail.currentSpot
    }),
    []
  );
  const { currentSpot } = useMappedState(mapState);
  const { currentUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);

  const initSpot = useCallback(async () => {
    setLoading(true);
    const apiInstance = new SpotsApi();
    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';

    apiInstance.spotsPlaceIdGet(placeId, (error, data, response) => {
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
    });
  }, [placeId, currentUser]);

  useEffect(() => {
    if (!currentUser || !currentUser.uid || !placeId) {
      return;
    }

    if (!currentSpot) {
      initSpot();
    }
  }, [currentUser, placeId]);

  const title = `${placeData.name} | Qoodish`;
  const description = placeData.formatted_address;
  const keywords = `${placeData.name}, Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip`;
  const basePath =
    router.locale === router.defaultLocale ? '' : `/${router.locale}`;

  return (
    <Layout hideBottomNav={true} fullWidth={false}>
      <Head>
        <title>{title}</title>

        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}/sports/${placeData.place_id}`}
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/sports/${placeData.place_id}`}
          hrefLang="en"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/ja/sports/${placeData.place_id}`}
          hrefLang="ja"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/sports/${placeData.place_id}`}
          hrefLang="x-default"
        />

        <meta name="keywords" content={keywords} />
        <meta name="description" content={description} />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}/sports/${placeData.place_id}`}
        />
        <meta property="og:image" content={thumbnailUrl} />

        <meta name="twitter:card" content="summary_large_image" />

        <meta property="og:locale" content={router.locale} />
        <meta property="og:site_name" content={I18n.t('meta headline')} />
      </Head>

      <div>
        {loading ? (
          <div className={classes.progress}>
            <CircularProgress />
          </div>
        ) : currentSpot ? (
          <SpotCard currentSpot={currentSpot} placeId={placeId as string} />
        ) : (
          <NoContents contentType="spot" message={I18n.t('place not found')} />
        )}
      </div>
    </Layout>
  );
};

const prisma = new PrismaClient();
const client = new Client();

export const getServerSideProps: GetServerSideProps = async ({
  res,
  params,
  locale
}) => {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=300'
  );

  const place = await prisma.place.findUnique({
    where: {
      place_id_val: String(params.placeId)
    },
    include: {
      spots: {
        include: {
          reviews: {
            include: {
              images: true
            }
          }
        }
      }
    }
  });

  if (!place) {
    return {
      notFound: true
    };
  }

  const placeDetails = await client.placeDetails({
    params: {
      place_id: place.place_id_val,
      language: Language[locale],
      key: process.env.GOOGLE_API_KEY
    }
  });

  const thumbnail = place.spots[0]?.reviews[0]?.images[0];

  return {
    props: {
      place: JSON.parse(
        JSON.stringify(place, (_key, value) =>
          typeof value === 'bigint' ? Number(value) : value
        )
      ),
      placeData: placeDetails.data.result,
      thumbnailUrl: !thumbnail
        ? process.env.NEXT_PUBLIC_OGP_IMAGE_URL
        : `${process.env.NEXT_PUBLIC_CLOUD_STORAGE_ENDPOINT}/${
            process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
          }/images/thumbnails/${path.basename(
            thumbnail.url,
            path.extname(thumbnail.url)
          )}_800x800${path.extname(thumbnail.url)}`
    }
  };
};

export default React.memo(SpotDetail);
