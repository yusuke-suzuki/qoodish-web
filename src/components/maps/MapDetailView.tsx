'use client';

import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import type {
  AppMap,
  Chapter,
  Coauthor,
  Journey,
  Pin,
  Profile
} from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useJourney, { type PauseReason } from '../../hooks/useJourney.ts';
import IssueDialog from '../common/IssueDialog.tsx';
import EndJourneyDialog from '../journeys/EndJourneyDialog.tsx';
import JourneyFab from '../journeys/JourneyFab.tsx';
import JourneyOverlay from '../journeys/JourneyOverlay.tsx';
import JourneyProgressSheet from '../journeys/JourneyProgressSheet.tsx';
import StartJourneyDialog from '../journeys/StartJourneyDialog.tsx';
import CustomOverlays from './CustomOverlays.tsx';
import { drawerBleeding } from './constants.ts';
import DeleteMapDialog from './DeleteMapDialog.tsx';
import EditMapDialog from './EditMapDialog.tsx';
import GoogleMaps from './GoogleMaps.tsx';
import MapSummaryCard from './MapSummaryCard.tsx';
import MobileMapDrawer from './MobileMapDrawer.tsx';
import PinDrawer from './PinDrawer.tsx';

const summaryCardHeight = 360;

type Props = {
  map: AppMap;
  pins: Pin[];
  coauthors: Coauthor[];
  chapters: Chapter[];
  currentProfile: Profile | null;
  currentJourney: Journey | null;
};

export default function MapDetailView({
  map,
  pins,
  coauthors,
  chapters,
  currentProfile,
  currentJourney
}: Props) {
  const theme = useTheme();
  const canRecord = useMediaQuery(theme.breakpoints.down('lg'), {
    noSsr: true
  });
  const dictionary = useDictionary();

  const { lang } = useParams<{ lang: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleCheckin = (pin: Pin) => {
    enqueueSnackbar(dictionary['checked in'].replace('{name}', pin.name), {
      variant: 'success'
    });
  };

  const handleLocationError = () => {
    enqueueSnackbar(dictionary['location unavailable'], { variant: 'error' });
  };

  const handlePaused = (reason: PauseReason) => {
    enqueueSnackbar(
      reason === 'permission'
        ? dictionary['journey paused permission']
        : dictionary['journey paused inactivity'],
      { variant: 'warning' }
    );
  };

  const handleJourneyError = (message: string | null) => {
    enqueueSnackbar(message ?? dictionary['an error occurred'], {
      variant: 'error'
    });
  };

  const [journeyPosition, setJourneyPosition] =
    useState<GeolocationPosition | null>(null);

  const {
    journey,
    trail,
    paused,
    addMilestone,
    start,
    end,
    pause,
    resume,
    removeMilestone,
    removeCheckin,
    attachCheckinImage,
    removeCheckinImage,
    updateCheckinNote
  } = useJourney({
    map,
    pins,
    initialJourney: currentJourney,
    canRecord,
    onCheckin: handleCheckin,
    onPosition: setJourneyPosition,
    onLocationError: handleLocationError,
    onPaused: handlePaused,
    onError: handleJourneyError
  });

  const [progressOpen, setProgressOpen] = useState(false);
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState<Pin | null>(null);
  const [pinDrawerOpen, setPinDrawerOpen] = useState(false);

  const journeyActive = Boolean(journey?.started_at && !journey?.finished_at);

  const milestoneOrders = new Map(
    (journey?.milestones ?? []).map((milestone, index) => [
      milestone.pin_id,
      index + 1
    ])
  );

  const checkedInPinIds = new Set(
    (journey?.checkins ?? []).map((checkin) => checkin.pin_id)
  );

  const handleAddMilestone = async (pin: Pin) => {
    const added = await addMilestone(pin);

    if (added) {
      enqueueSnackbar(
        dictionary['added to milestones'].replace('{name}', pin.name),
        { variant: 'success' }
      );
      setPinDrawerOpen(false);
    }
  };

  const handleStart = async () => {
    const started = await start();

    if (started) {
      setStartDialogOpen(false);
    }
  };

  const handlePause = () => {
    pause();
    enqueueSnackbar(dictionary['journey recording paused'], {
      variant: 'info'
    });
  };

  const handleResume = async () => {
    const resumed = await resume();

    enqueueSnackbar(
      resumed
        ? dictionary['journey recording resumed']
        : dictionary['journey resume unavailable'],
      { variant: resumed ? 'success' : 'error' }
    );
  };

  const handleEnd = async () => {
    const finished = await end();

    if (!finished) {
      return;
    }

    setEndDialogOpen(false);
    setProgressOpen(false);
    router.push(`/${lang}/journeys/${finished.journey.id}`);
  };

  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const zoom = searchParams.get('zoom');

  const [center, setCenter] = useState<google.maps.LatLngLiteral | null>(null);
  const [currentZoom, setCurrentZoom] = useState(17);

  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handlePinSaved = () => {
    router.refresh();
  };

  const handlePinClick = (pin: Pin) => {
    setCurrentPin(pin);
    setPinDrawerOpen(true);
  };

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
        pins={pins}
        coauthors={coauthors}
        chapters={chapters}
        currentProfile={currentProfile}
        onEditClick={() => setEditDialogOpen(true)}
        onDeleteClick={() => setDeleteDialogOpen(true)}
        onReportClick={() => setIssueDialogOpen(true)}
        onSaved={router.refresh}
        onPinClick={handlePinClick}
        pinDrawerOpen={pinDrawerOpen}
      />

      <PinDrawer
        currentPin={currentPin}
        open={pinDrawerOpen}
        onOpen={() => setPinDrawerOpen(true)}
        onClose={() => setPinDrawerOpen(false)}
        onExited={() => setCurrentPin(null)}
        milestoneAction={
          currentPin
            ? {
                selected: milestoneOrders.has(currentPin.id),
                onAdd: () => handleAddMilestone(currentPin)
              }
            : null
        }
        onSaved={handlePinSaved}
        onDeleted={handlePinSaved}
      />

      <Box sx={{ display: { xs: 'block', md: 'flex' } }}>
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            width: summaryCardHeight,
            zIndex: 1,
            height: 'calc(100dvh - var(--chrome-top, 0px))'
          }}
        >
          <MapSummaryCard
            map={map}
            pins={pins}
            coauthors={coauthors}
            chapters={chapters}
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
              xs: `calc(100dvh - ${drawerBleeding}px - var(--chrome-top, 0px))`,
              md: 'calc(100dvh - var(--chrome-top, 0px))'
            },
            width: {
              md: `calc(100dvw - ${summaryCardHeight}px - var(--chrome-left, 0px))`
            }
          }}
          center={center}
          zoom={currentZoom}
        >
          <CustomOverlays
            map={map}
            pins={pins}
            milestoneOrders={milestoneOrders}
            checkedInPinIds={checkedInPinIds}
            onPinSaved={handlePinSaved}
            onPinClick={handlePinClick}
          />
          <JourneyOverlay
            position={journeyPosition}
            path={journeyActive ? trail : null}
          />
          {canRecord && (
            <>
              <JourneyFab
                disabled={false}
                journey={journey}
                paused={paused}
                onStartClick={() => setStartDialogOpen(true)}
                onOpenProgress={() => setProgressOpen(true)}
              />
              <JourneyProgressSheet
                open={progressOpen}
                onClose={() => setProgressOpen(false)}
                onOpen={() => setProgressOpen(true)}
                journey={journey}
                pins={pins}
                paused={paused}
                onRemoveMilestone={removeMilestone}
                onRemoveCheckin={removeCheckin}
                onAttachImage={attachCheckinImage}
                onRemoveImage={removeCheckinImage}
                onSaveNote={updateCheckinNote}
                onStartClick={() => setStartDialogOpen(true)}
                onPauseClick={handlePause}
                onResumeClick={handleResume}
                onEndClick={() => setEndDialogOpen(true)}
              />
            </>
          )}
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

      <StartJourneyDialog
        open={startDialogOpen}
        onClose={() => setStartDialogOpen(false)}
        onConfirm={handleStart}
      />

      <EndJourneyDialog
        open={endDialogOpen}
        onClose={() => setEndDialogOpen(false)}
        onEnd={handleEnd}
      />
    </>
  );
}
