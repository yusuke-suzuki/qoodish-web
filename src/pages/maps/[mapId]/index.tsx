import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo
} from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import selectMap from '../../../actions/selectMap';
import openToast from '../../../actions/openToast';
import clearMapState from '../../../actions/clearMapState';
import fetchMapReviews from '../../../actions/fetchMapReviews';
import fetchCollaborators from '../../../actions/fetchCollaborators';

import {
  Box,
  createStyles,
  Grid,
  makeStyles,
  Theme,
  useMediaQuery,
  useTheme
} from '@material-ui/core';

import {
  ApiClient,
  MapsApi,
  CollaboratorsApi,
  ReviewsApi
} from '@yusuke-suzuki/qoodish-api-js-client';

import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import Fab from '@material-ui/core/Fab';
import switchSummary from '../../../actions/switchSummary';
import AuthContext from '../../../context/AuthContext';
import CreateResourceButton from '../../../components/molecules/CreateResourceButton';
import { useRouter } from 'next/router';
import SpotHorizontalList from '../../../components/organisms/SpotHorizontalList';
import DeleteMapDialog from '../../../components/organisms/DeleteMapDialog';
import MapSpotDrawer from '../../../components/organisms/MapSpotDrawer';
import GoogleMaps from '../../../components/organisms/GoogleMaps';
import InviteTargetDialog from '../../../components/organisms/InviteTargetDialog';
import Layout from '../../../components/Layout';
import Head from 'next/head';
import SpotMarkers from '../../../components/organisms/SpotMarkers';
import MapSummaryDrawer from '../../../components/organisms/MapSummaryDrawer';
import { use100vh } from 'react-div-100vh';
import CurrentLocationButton from '../../../components/molecules/CurrentLocationButton';
import { GetServerSideProps } from 'next';
import { Map, PrismaClient } from '@prisma/client';

import path from 'path';
import { useLocale } from '../../../hooks/useLocale';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mapWrapper: {
      [theme.breakpoints.up('lg')]: {
        marginLeft: 380
      }
    },
    buttonGroup: {
      position: 'fixed',
      zIndex: 1,
      bottom: theme.spacing(18),
      right: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        bottom: theme.spacing(4),
        right: theme.spacing(4)
      }
    },
    switchSummaryContainer: {
      textAlign: 'center',
      width: '100%',
      position: 'absolute',
      zIndex: 1,
      top: 70,
      [theme.breakpoints.up('sm')]: {
        top: 78
      }
    },
    infoIcon: {
      marginRight: 6
    }
  })
);

type Props = {
  isPrivate: boolean;
  map: Map | null;
  thumbnailUrl: string;
};

const MapPage = (props: Props) => {
  const { isPrivate, map, thumbnailUrl } = props;

  const { I18n } = useLocale();

  const { currentUser } = useContext(AuthContext);

  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const dispatch = useDispatch();
  const router = useRouter();
  const { mapId } = router.query;
  const classes = useStyles();

  const mapState = useCallback(
    state => ({
      currentMap: state.mapDetail.currentMap
    }),
    []
  );
  const { currentMap } = useMappedState(mapState);

  const height = use100vh();

  const wrapperHeight = useMemo(() => {
    const marginTop = mdUp ? theme.spacing(8) : theme.spacing(7);

    return height ? height - marginTop : `calc(100vh - ${marginTop}px)`;
  }, [height, mdUp]);

  const disabled = useMemo(() => {
    return !(currentMap && currentMap.postable && currentMap.following);
  }, [currentMap]);

  const initMap = useCallback(async () => {
    const apiInstance = new MapsApi();
    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';

    apiInstance.mapsMapIdGet(mapId, (error, data, response) => {
      if (response.ok) {
        dispatch(selectMap(response.body));
      } else if (response.status == 401) {
        dispatch(openToast('Authenticate failed'));
      } else if (response.status == 404) {
        router.push('');
        dispatch(openToast(I18n.t('map not found')));
      } else {
        dispatch(openToast('Failed to fetch Map.'));
      }
    });
  }, [dispatch, router, mapId, currentUser]);

  const initMapReviews = useCallback(async () => {
    const apiInstance = new ReviewsApi();
    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';

    apiInstance.mapsMapIdReviewsGet(mapId, {}, (error, data, response) => {
      if (response.ok) {
        dispatch(fetchMapReviews(response.body));
      }
    });
  }, [dispatch, mapId, currentUser]);

  const initFollowers = useCallback(async () => {
    const apiInstance = new CollaboratorsApi();
    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';

    apiInstance.mapsMapIdCollaboratorsGet(mapId, (error, data, response) => {
      if (response.ok) {
        dispatch(fetchCollaborators(response.body));
      } else {
        console.log('API called successfully. Returned data: ' + data);
      }
    });
  }, [mapId, currentUser]);

  const handleSummaryButtonClick = useCallback(() => {
    dispatch(switchSummary());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser && mapId) {
      initMap();
      initMapReviews();
      initFollowers();
    }

    return () => {
      dispatch(clearMapState());
    };
  }, [currentUser, mapId]);

  const title = isPrivate ? 'Qoodish' : `${map.name} | Qoodish`;
  const description = isPrivate ? I18n.t('meta description') : map.description;
  const keywords =
    (isPrivate ? '' : `${map.name}, `) +
    'Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip';
  const basePath =
    router.locale === router.defaultLocale ? '' : `/${router.locale}`;

  return (
    <Layout hideBottomNav={true} fullWidth={true}>
      <Head>
        <title>{title}</title>

        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}/maps/${map.id}`}
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/maps/${map.id}`}
          hrefLang="en"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/ja/maps/${map.id}`}
          hrefLang="ja"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/maps/${map.id}`}
          hrefLang="x-default"
        />

        {isPrivate && <meta name="robots" content="noindex" />}

        <meta name="keywords" content={keywords} />
        <meta name="description" content={description} />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}/maps/${map.id}`}
        />
        <meta property="og:image" content={thumbnailUrl} />

        <meta name="twitter:card" content="summary_large_image" />

        <meta property="og:locale" content={router.locale} />
        <meta property="og:site_name" content={I18n.t('meta headline')} />
      </Head>

      <Box
        position="relative"
        className={classes.mapWrapper}
        style={{
          height: wrapperHeight
        }}
      >
        <GoogleMaps>
          <SpotMarkers />

          <div className={classes.buttonGroup}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={6}>
                <CreateResourceButton defaultCreateReview disabled={disabled} />
              </Grid>
              <Grid item xs={6}>
                <CurrentLocationButton />
              </Grid>
            </Grid>
          </div>
        </GoogleMaps>
      </Box>

      {!lgUp && (
        <>
          <div className={classes.switchSummaryContainer}>
            <Fab
              variant="extended"
              size="small"
              color="primary"
              onClick={handleSummaryButtonClick}
            >
              <InfoOutlinedIcon className={classes.infoIcon} />
              {I18n.t('summary')}
            </Fab>
          </div>
          <SpotHorizontalList />
          <MapSpotDrawer />
        </>
      )}

      <MapSummaryDrawer />
      <DeleteMapDialog />
      <InviteTargetDialog mapId={Number(mapId)} />
    </Layout>
  );
};

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async ({
  res,
  params
}) => {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=300'
  );

  const map = await prisma.map.findUnique({
    where: {
      id: Number(params.mapId)
    }
  });

  if (!map) {
    return {
      notFound: true
    };
  }

  const isPrivate = map.private;

  return {
    props: {
      isPrivate: isPrivate,
      map: isPrivate
        ? null
        : JSON.parse(
            JSON.stringify(map, (_key, value) =>
              typeof value === 'bigint' ? Number(value) : value
            )
          ),
      thumbnailUrl:
        isPrivate || !map.image_url
          ? process.env.NEXT_PUBLIC_OGP_IMAGE_URL
          : `${process.env.NEXT_PUBLIC_CLOUD_STORAGE_ENDPOINT}/${
              process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
            }/maps/thumbnails/${path.basename(
              map.image_url,
              path.extname(map.image_url)
            )}_800x800${path.extname(map.image_url)}`
    }
  };
};

export default memo(MapPage);
