'use client';

import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { AppMap, Follower, Profile, Review } from '../../../types';
import IssueDialog from '../common/IssueDialog';
import CustomOverlays from './CustomOverlays';
import DeleteMapDialog from './DeleteMapDialog';
import EditMapDialog from './EditMapDialog';
import GoogleMaps from './GoogleMaps';
import MapSummaryCard from './MapSummaryCard';
import MobileMapDrawer from './MobileMapDrawer';
import ReviewDrawer from './ReviewDrawer';

const bottomSheetHeight = 105;
const summaryCardHeight = 360;

type Props = {
  map: AppMap;
  reviews: Review[];
  followers: Follower[];
  currentProfile: Profile | null;
};

export default function MapDetailView({
  map,
  reviews,
  followers,
  currentProfile
}: Props) {
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

  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  const [reviewDrawerOpen, setReviewDrawerOpen] = useState(false);

  const handleReviewSaved = useCallback(() => {
    router.refresh();
  }, [router]);

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

  return (
    <>
      {mdDown && (
        <MobileMapDrawer
          map={map}
          reviews={reviews}
          followers={followers}
          currentProfile={currentProfile}
          onEditClick={() => setEditDialogOpen(true)}
          onDeleteClick={() => setDeleteDialogOpen(true)}
          onReportClick={() => setIssueDialogOpen(true)}
          onSaved={router.refresh}
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
              reviews={reviews}
              followers={followers}
              currentProfile={currentProfile}
              onEditClick={() => setEditDialogOpen(true)}
              onDeleteClick={() => setDeleteDialogOpen(true)}
              onReportClick={() => setIssueDialogOpen(true)}
              onSaved={router.refresh}
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
            map={map}
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
        onSaved={router.refresh}
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
        contentId={map.id}
      />
    </>
  );
}
