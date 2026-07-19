'use client';

import { Box, useTheme } from '@mui/material';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  AppMap,
  Coauthor,
  Journey,
  Profile,
  Review
} from '../../../types';
import { createChapter } from '../../actions/chapters';
import useDictionary from '../../hooks/useDictionary';
import useJourney from '../../hooks/useJourney';
import { createChapterContent } from '../../utils/chapterContent';
import IssueDialog from '../common/IssueDialog';
import EndJourneyDialog from '../journeys/EndJourneyDialog';
import JourneyFab from '../journeys/JourneyFab';
import JourneyOverlay from '../journeys/JourneyOverlay';
import JourneyProgressSheet from '../journeys/JourneyProgressSheet';
import CustomOverlays from './CustomOverlays';
import DeleteMapDialog from './DeleteMapDialog';
import EditMapDialog from './EditMapDialog';
import GoogleMaps from './GoogleMaps';
import MapSummaryCard from './MapSummaryCard';
import MobileMapDrawer from './MobileMapDrawer';
import ReviewDrawer from './ReviewDrawer';
import { drawerBleeding } from './constants';

const summaryCardHeight = 360;

type Props = {
  map: AppMap;
  reviews: Review[];
  coauthors: Coauthor[];
  currentProfile: Profile | null;
  currentJourney: Journey | null;
};

export default function MapDetailView({
  map,
  reviews,
  coauthors,
  currentProfile,
  currentJourney
}: Props) {
  const theme = useTheme();
  const dictionary = useDictionary();

  const { lang, mapId } = useParams<{ lang: string; mapId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleCheckin = useCallback(
    (review: Review) => {
      enqueueSnackbar(dictionary['checked in'].replace('{name}', review.name), {
        variant: 'success'
      });
    },
    [dictionary]
  );

  const handleLocationError = useCallback(() => {
    enqueueSnackbar(dictionary['location unavailable'], { variant: 'error' });
  }, [dictionary]);

  const handleJourneyError = useCallback(
    (message: string | null) => {
      enqueueSnackbar(message ?? dictionary['an error occurred'], {
        variant: 'error'
      });
    },
    [dictionary]
  );

  const [journeyPosition, setJourneyPosition] =
    useState<GeolocationPosition | null>(null);

  const {
    journey,
    trail,
    addMilestone,
    start,
    end,
    removeMilestone,
    removeCheckin,
    attachCheckinImage,
    removeCheckinImage,
    updateCheckinNote
  } = useJourney({
    map,
    reviews,
    initialJourney: currentJourney,
    onCheckin: handleCheckin,
    onPosition: setJourneyPosition,
    onLocationError: handleLocationError,
    onError: handleJourneyError
  });

  const [progressOpen, setProgressOpen] = useState(false);
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  const [reviewDrawerOpen, setReviewDrawerOpen] = useState(false);

  const journeyActive = Boolean(journey?.started_at && !journey?.finished_at);

  const milestoneOrders = useMemo(
    () =>
      new Map(
        (journey?.milestones ?? []).map((milestone, index) => [
          milestone.review_id,
          index + 1
        ])
      ),
    [journey]
  );

  const handleAddMilestone = useCallback(
    async (review: Review) => {
      const added = await addMilestone(review);

      if (added) {
        enqueueSnackbar(
          dictionary['added to milestones'].replace('{name}', review.name),
          { variant: 'success' }
        );
        setReviewDrawerOpen(false);
      }
    },
    [addMilestone, dictionary]
  );

  const handleEnd = useCallback(async () => {
    const finished = await end();

    if (!finished) {
      return;
    }

    const { success, data, error } = await createChapter(map.id, {
      title: dictionary['untitled journey'],
      content: createChapterContent(finished.journey, finished.trail),
      journey_id: finished.journey.id
    });

    if (!success || !data) {
      enqueueSnackbar(error ?? dictionary['an error occurred'], {
        variant: 'error'
      });
      return;
    }

    setEndDialogOpen(false);
    setProgressOpen(false);
    router.push(`/${lang}/maps/${map.id}/chapters/${data.id}`);
  }, [end, map.id, router, lang, dictionary]);

  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const zoom = searchParams.get('zoom');

  const [center, setCenter] = useState<google.maps.LatLngLiteral | null>(null);
  const [currentZoom, setCurrentZoom] = useState(17);

  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
      <MobileMapDrawer
        map={map}
        reviews={reviews}
        coauthors={coauthors}
        currentProfile={currentProfile}
        onEditClick={() => setEditDialogOpen(true)}
        onDeleteClick={() => setDeleteDialogOpen(true)}
        onReportClick={() => setIssueDialogOpen(true)}
        onSaved={router.refresh}
        onReviewClick={handleReviewClick}
        reviewDrawerOpen={reviewDrawerOpen}
      />

      <ReviewDrawer
        currentReview={currentReview}
        open={reviewDrawerOpen}
        onOpen={() => setReviewDrawerOpen(true)}
        onClose={() => setReviewDrawerOpen(false)}
        onExited={() => setCurrentReview(null)}
        milestoneAction={
          currentReview
            ? {
                selected: milestoneOrders.has(currentReview.id),
                onAdd: () => handleAddMilestone(currentReview)
              }
            : null
        }
        onSaved={handleReviewSaved}
        onDeleted={handleReviewSaved}
      />

      <Box sx={{ display: { xs: 'block', md: 'flex' } }}>
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            width: summaryCardHeight,
            zIndex: 1,
            height: '100dvh'
          }}
        >
          <MapSummaryCard
            map={map}
            reviews={reviews}
            coauthors={coauthors}
            currentProfile={currentProfile}
            onEditClick={() => setEditDialogOpen(true)}
            onDeleteClick={() => setDeleteDialogOpen(true)}
            onReportClick={() => setIssueDialogOpen(true)}
            onSaved={router.refresh}
          />
        </Box>

        <GoogleMaps
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID}
          sx={{
            height: {
              xs: `calc(100dvh - ${drawerBleeding}px - ${theme.spacing(7)})`,
              sm: `calc(100dvh - ${drawerBleeding}px - ${theme.spacing(8)})`,
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
            milestoneOrders={milestoneOrders}
            onReviewSaved={handleReviewSaved}
            onReviewClick={handleReviewClick}
          />
          <JourneyOverlay
            position={journeyPosition}
            path={journeyActive ? trail : null}
          />
          <JourneyFab
            disabled={false}
            journey={journey}
            onStart={start}
            onOpenProgress={() => setProgressOpen(true)}
          />
          <JourneyProgressSheet
            open={progressOpen}
            onClose={() => setProgressOpen(false)}
            journey={journey}
            reviews={reviews}
            onRemoveMilestone={removeMilestone}
            onRemoveCheckin={removeCheckin}
            onAttachImage={attachCheckinImage}
            onRemoveImage={removeCheckinImage}
            onSaveNote={updateCheckinNote}
            onEndClick={() => setEndDialogOpen(true)}
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

      <EndJourneyDialog
        open={endDialogOpen}
        onClose={() => setEndDialogOpen(false)}
        onEnd={handleEnd}
      />
    </>
  );
}
