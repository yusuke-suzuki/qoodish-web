'use client';

import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { useContext, useEffect, useMemo, useState } from 'react';
import type {
  AppMap,
  Chapter,
  Coauthor,
  Journey,
  Pin,
  PinProperty,
  Profile
} from '../../../types/index.ts';
import ShellContext from '../../context/ShellContext.tsx';
import useDictionary from '../../hooks/useDictionary.ts';
import useJourney, { type PauseReason } from '../../hooks/useJourney.ts';
import { matchesOptions } from '../../utils/pinPropertyOptions.ts';
import ReportDialog from '../common/ReportDialog.tsx';
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
import PinPropertiesDialog from './PinPropertiesDialog.tsx';
import PinPropertyFilter from './PinPropertyFilter.tsx';

const summaryCardHeight = 360;

type Props = {
  map: AppMap;
  pins: Pin[];
  pinProperties: PinProperty[];
  coauthors: Coauthor[];
  chapters: Chapter[];
  currentProfile: Profile | null;
  currentJourney: Journey | null;
};

export default function MapDetailView({
  map,
  pins,
  pinProperties,
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

  const handleJourneyError = (message?: string | null) => {
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
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [pinDrawerOpen, setPinDrawerOpen] = useState(false);
  const [mapDrawerOpen, setMapDrawerOpen] = useState(false);

  const { setAppBarHidden } = useContext(ShellContext);

  const changeMapDrawerOpen = (open: boolean) => {
    setMapDrawerOpen(open);
    setAppBarHidden(open && !pinDrawerOpen);
  };

  const changePinDrawerOpen = (open: boolean) => {
    setPinDrawerOpen(open);
    setAppBarHidden(mapDrawerOpen && !open);
  };

  useEffect(() => {
    return () => setAppBarHidden(false);
  }, [setAppBarHidden]);

  const [filterOptionIds, setFilterOptionIds] = useState<number[]>([]);

  const visiblePins = pins.filter((pin) =>
    matchesOptions(pin.property_option_ids, pinProperties, filterOptionIds)
  );

  const currentPin = selectedPin
    ? (pins.find((pin) => pin.id === selectedPin.id) ?? selectedPin)
    : null;

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
      changePinDrawerOpen(false);
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

  const center = useMemo(
    () => (lat && lng ? { lat: Number(lat), lng: Number(lng) } : null),
    [lat, lng]
  );
  const currentZoom = zoom ? Number(zoom) : undefined;

  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pinPropertiesDialogOpen, setPinPropertiesDialogOpen] = useState(false);

  const handlePinSaved = () => {
    router.refresh();
  };

  const handlePinClick = (pin: Pin) => {
    setSelectedPin(pin);
    changePinDrawerOpen(true);
  };

  return (
    <>
      <MobileMapDrawer
        map={map}
        pins={visiblePins}
        coauthors={coauthors}
        chapters={chapters}
        currentProfile={currentProfile}
        onEditClick={() => setEditDialogOpen(true)}
        onDeleteClick={() => setDeleteDialogOpen(true)}
        onReportClick={() => setReportDialogOpen(true)}
        onPinPropertiesClick={() => setPinPropertiesDialogOpen(true)}
        onSaved={router.refresh}
        onPinClick={handlePinClick}
        pinDrawerOpen={pinDrawerOpen}
        open={mapDrawerOpen}
        onOpenChange={changeMapDrawerOpen}
      />

      <PinDrawer
        currentPin={currentPin}
        map={map}
        pinProperties={pinProperties}
        open={pinDrawerOpen}
        onOpen={() => changePinDrawerOpen(true)}
        onClose={() => changePinDrawerOpen(false)}
        onExited={() => setSelectedPin(null)}
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
            pins={visiblePins}
            coauthors={coauthors}
            chapters={chapters}
            currentProfile={currentProfile}
            onEditClick={() => setEditDialogOpen(true)}
            onDeleteClick={() => setDeleteDialogOpen(true)}
            onReportClick={() => setReportDialogOpen(true)}
            onPinPropertiesClick={() => setPinPropertiesDialogOpen(true)}
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
          position={journeyPosition}
        >
          <CustomOverlays
            map={map}
            pins={visiblePins}
            pinProperties={pinProperties}
            milestoneOrders={milestoneOrders}
            checkedInPinIds={checkedInPinIds}
            filter={
              <PinPropertyFilter
                pinProperties={pinProperties}
                value={filterOptionIds}
                onChange={setFilterOptionIds}
              />
            }
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

      {map.editable && (
        <PinPropertiesDialog
          open={pinPropertiesDialogOpen}
          onClose={() => setPinPropertiesDialogOpen(false)}
          map={map}
          pinProperties={pinProperties}
        />
      )}

      <ReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        moderatableType="Map"
        moderatableId={map.id}
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
