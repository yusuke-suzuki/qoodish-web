import { Box, useMediaQuery, useTheme } from '@mui/material';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import { AppMap } from '../../../../types';
import Layout from '../../../components/Layout';
import IssueDialog from '../../../components/common/IssueDialog';
import CustomOverlays from '../../../components/maps/CustomOverlays';
import DeleteMapDialog from '../../../components/maps/DeleteMapDialog';
import EditMapDialog from '../../../components/maps/EditMapDialog';
import GoogleMaps from '../../../components/maps/GoogleMaps';
import MapSummaryCard from '../../../components/maps/MapSummaryCard';
import MobileMapDrawer from '../../../components/maps/MobileMapDrawer';
import AuthContext from '../../../context/AuthContext';
import useDictionary from '../../../hooks/useDictionary';
import { useMap } from '../../../hooks/useMap';
import { useMapReviews } from '../../../hooks/useMapReviews';
import { useProfile } from '../../../hooks/useProfile';
import { NextPageWithLayout } from '../../_app';

type Props = {
  map: AppMap | null;
};

const MapPage: NextPageWithLayout = ({ map: serverMap }: Props) => {
  const dictionary = useDictionary();
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const mdDown = useMediaQuery(theme.breakpoints.down('md'));

  const router = useRouter();
  const {
    query: { mapId, lat, lng, zoom }
  } = router;

  const [center, setCenter] = useState<google.maps.LatLngLiteral | null>(null);
  const [currentZoom, setCurrentZoom] = useState(17);

  const { currentUser } = useContext(AuthContext);
  const { profile } = useProfile(currentUser?.uid);

  const { map: clientMap, mutate: mutateMap } = useMap(Number(mapId));
  const { reviews, mutate: mutateReviews } = useMapReviews(Number(mapId));

  const map = clientMap || serverMap;

  const title = map ? `${map.name} | Qoodish` : 'Qoodish';
  const description = map ? map.description : dictionary['meta description'];
  const keywords = `${
    map ? `${map.name}, ` : ''
  }Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip`;
  const basePath =
    router.locale === router.defaultLocale ? '' : `/${router.locale}`;
  const defaultThumbnailUrl =
    router.locale === router.defaultLocale
      ? process.env.NEXT_PUBLIC_OGP_IMAGE_URL_EN
      : process.env.NEXT_PUBLIC_OGP_IMAGE_URL_JA;
  const thumbnailUrl = map ? map.thumbnail_url_800 : defaultThumbnailUrl;

  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleReviewSaved = useCallback(() => {
    mutateMap();
    mutateReviews();
  }, [mutateMap, mutateReviews]);

  useEffect(() => {
    if (lat && lng) {
      setCenter({
        lat: Number(lat),
        lng: Number(lng)
      });
    }
  }, [lat, lng]);

  useEffect(() => {
    if (zoom) {
      setCurrentZoom(Number(zoom));
    }
  }, [zoom]);

  return (
    <>
      <Head>
        <title>{title}</title>

        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}/maps/${mapId}`}
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/maps/${mapId}`}
          hrefLang="en"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/ja/maps/${mapId}`}
          hrefLang="ja"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/maps/${mapId}`}
          hrefLang="x-default"
        />

        {!serverMap && <meta name="robots" content="noindex" />}

        <meta name="keywords" content={keywords} />
        <meta name="description" content={description} />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}/maps/${mapId}`}
        />
        <meta property="og:image" content={thumbnailUrl} />

        <meta name="twitter:card" content="summary_large_image" />

        <meta property="og:locale" content={router.locale} />
        <meta property="og:site_name" content={dictionary['meta headline']} />
      </Head>

      {mdDown && (
        <MobileMapDrawer
          map={map}
          currentProfile={profile}
          onEditClick={() => setEditDialogOpen(true)}
          onDeleteClick={() => setDeleteDialogOpen(true)}
          onReportClick={() => setIssueDialogOpen(true)}
          onSaved={mutateMap}
        />
      )}

      <Box sx={{ display: { xs: 'block', md: 'flex' } }}>
        {mdUp && (
          <Box sx={{ width: 360, zIndex: 1, height: '100dvh' }}>
            <MapSummaryCard
              map={map}
              currentProfile={profile}
              onEditClick={() => setEditDialogOpen(true)}
              onDeleteClick={() => setDeleteDialogOpen(true)}
              onReportClick={() => setIssueDialogOpen(true)}
              onSaved={mutateMap}
            />
          </Box>
        )}

        <GoogleMaps
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID}
          sx={{
            height: {
              xs: `calc(100dvh - 120px - ${theme.spacing(7)})`,
              sm: `calc(100dvh - 120px - ${theme.spacing(8)})`,
              md: '100dvh'
            },
            width: {
              md: `calc(100dvw - 360px - ${theme.spacing(8)})`
            }
          }}
          center={center}
          zoom={currentZoom}
        >
          <CustomOverlays
            map={clientMap}
            reviews={reviews}
            onReviewSaved={handleReviewSaved}
          />
        </GoogleMaps>
      </Box>

      <EditMapDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        currentMap={map}
        onSaved={mutateMap}
      />

      <DeleteMapDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        map={map}
        onDeleted={router.reload}
      />

      <IssueDialog
        open={issueDialogOpen}
        onClose={() => setIssueDialogOpen(false)}
        contentType="map"
        contentId={map ? map.id : null}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  res,
  params,
  locale
}) => {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=300'
  );

  const request = new Request(
    `${process.env.API_ENDPOINT}/guest/maps/${params?.mapId}`,
    {
      method: 'GET',
      headers: new Headers({
        Accept: 'application/json',
        'Accept-Language': locale,
        'Content-Type': 'application/json'
      })
    }
  );

  const response = await fetch(request);
  const data = await response.json();

  return {
    props: {
      map: response.ok ? data : null
    }
  };
};

MapPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout hideBottomNav fullWidth>
      {page}
    </Layout>
  );
};

export default MapPage;
