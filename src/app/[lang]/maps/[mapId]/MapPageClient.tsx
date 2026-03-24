'use client';

import { KeyboardArrowLeft } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Container,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useContext, useEffect, useState } from 'react';
import type { AppMap, Review } from '../../../../../types';
import Layout from '../../../../components/Layout';
import IssueDialog from '../../../../components/common/IssueDialog';
import CustomOverlays from '../../../../components/maps/CustomOverlays';
import DeleteMapDialog from '../../../../components/maps/DeleteMapDialog';
import EditMapDialog from '../../../../components/maps/EditMapDialog';
import GoogleMaps from '../../../../components/maps/GoogleMaps';
import MapSummaryCard from '../../../../components/maps/MapSummaryCard';
import MobileMapDrawer from '../../../../components/maps/MobileMapDrawer';
import ReviewDrawer from '../../../../components/maps/ReviewDrawer';
import AuthContext from '../../../../context/AuthContext';
import useDictionary from '../../../../hooks/useDictionary';
import { useMap } from '../../../../hooks/useMap';
import { useMapReviews } from '../../../../hooks/useMapReviews';
import { useProfile } from '../../../../hooks/useProfile';

const bottomSheetHeight = 105;
const summaryCardHeight = 360;

type Props = {
  initialMap: AppMap | null;
};

export default function MapPageClient({ initialMap }: Props) {
  const dictionary = useDictionary();
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const mdDown = useMediaQuery(theme.breakpoints.down('md'));

  const { lang, mapId } = useParams<{ lang: string; mapId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const zoom = searchParams.get('zoom');

  const [center, setCenter] = useState<google.maps.LatLngLiteral | null>(null);
  const [currentZoom, setCurrentZoom] = useState(17);

  const { currentUser } = useContext(AuthContext);
  const { profile } = useProfile(currentUser?.uid);

  const {
    map: clientMap,
    mutate: mutateMap,
    isLoading
  } = useMap(Number(mapId));
  const { reviews, mutate: mutateReviews } = useMapReviews(Number(mapId));

  const map = clientMap || initialMap;

  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  const [reviewDrawerOpen, setReviewDrawerOpen] = useState(false);

  const handleReviewSaved = useCallback(() => {
    mutateMap();
    mutateReviews();
  }, [mutateMap, mutateReviews]);

  const handleReviewClick = useCallback((review: Review) => {
    setCurrentReview(review);
    setReviewDrawerOpen(true);
  }, []);

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

  if (!map && !isLoading) {
    return (
      <Layout hideBottomNav fullWidth>
        <Container
          sx={{
            py: { xs: 2, md: 4 }
          }}
        >
          <Alert severity="warning">
            <AlertTitle>{dictionary['page not found']}</AlertTitle>
            {dictionary['page not found description']}
          </Alert>
          <Link href={`/${lang}/discover`} passHref>
            <Button color="primary" startIcon={<KeyboardArrowLeft />}>
              {dictionary['back to our site']}
            </Button>
          </Link>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout hideBottomNav fullWidth>
      {mdDown && (
        <MobileMapDrawer
          map={map}
          currentProfile={profile}
          onEditClick={() => setEditDialogOpen(true)}
          onDeleteClick={() => setDeleteDialogOpen(true)}
          onReportClick={() => setIssueDialogOpen(true)}
          onSaved={mutateMap}
          onReviewClick={handleReviewClick}
          reviewDrawerOpen={reviewDrawerOpen}
        />
      )}

      {mdDown && (
        <ReviewDrawer
          currentReview={currentReview}
          open={reviewDrawerOpen}
          onOpen={() => setReviewDrawerOpen(true)}
          onClose={() => setReviewDrawerOpen(false)}
          onExited={() => setCurrentReview(null)}
          onSaved={handleReviewSaved}
          onDeleted={handleReviewSaved}
        />
      )}

      <Box sx={{ display: { xs: 'block', md: 'flex' } }}>
        {mdUp && (
          <Box sx={{ width: summaryCardHeight, zIndex: 1, height: '100dvh' }}>
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
              xs: `calc(100dvh - ${bottomSheetHeight}px - ${theme.spacing(7)})`,
              sm: `calc(100dvh - ${bottomSheetHeight}px - ${theme.spacing(8)})`,
              md: '100dvh'
            },
            width: {
              md: `calc(100dvw - ${summaryCardHeight}px - ${theme.spacing(8)})`
            }
          }}
          center={center}
          zoom={currentZoom}
          locale={lang}
        >
          <CustomOverlays
            map={clientMap}
            reviews={reviews}
            onReviewSaved={handleReviewSaved}
            onReviewClick={handleReviewClick}
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
        onDeleted={router.refresh}
      />

      <IssueDialog
        open={issueDialogOpen}
        onClose={() => setIssueDialogOpen(false)}
        contentType="map"
        contentId={map ? map.id : null}
      />
    </Layout>
  );
}
