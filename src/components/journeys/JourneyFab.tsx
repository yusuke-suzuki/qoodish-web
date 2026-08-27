import { DirectionsWalk, Pause } from '@mui/icons-material';
import { Box, Fab } from '@mui/material';
import { memo, useContext, useEffect, useState } from 'react';
import type { Journey } from '../../../types/index.ts';
import AuthContext from '../../context/AuthContext.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import { useGoogleMap } from '../../hooks/useGoogleMap.ts';
import WalkingFootprints from '../common/WalkingFootprints.tsx';
import MapControl from '../maps/MapControl.tsx';

type Props = {
  disabled: boolean;
  journey: Journey | null;
  paused: boolean;
  onStartClick: () => void;
  onOpenProgress: () => void;
};

function JourneyFab({
  disabled,
  journey,
  paused,
  onStartClick,
  onOpenProgress
}: Props) {
  const dictionary = useDictionary();
  const { googleMap, loader } = useGoogleMap();
  const { authenticated, setSignInRequired } = useContext(AuthContext);

  const [controlPosition, setControlPosition] =
    useState<google.maps.ControlPosition | null>(null);

  useEffect(() => {
    if (!googleMap || !loader) {
      return;
    }

    let cancelled = false;

    (async () => {
      const { ControlPosition } = await loader.importLibrary('core');

      if (cancelled) {
        return;
      }

      setControlPosition(ControlPosition.BOTTOM_CENTER);
    })();

    return () => {
      cancelled = true;
    };
  }, [googleMap, loader]);

  const active = Boolean(journey?.started_at && !journey?.finished_at);

  // A journey that exists but has not started still holds milestones worth
  // reviewing, so the sheet opens first and starting happens from there.
  const handleClick = () => {
    if (journey) {
      onOpenProgress();
      return;
    }

    if (!authenticated) {
      setSignInRequired(true);
      return;
    }

    onStartClick();
  };

  const icon = !active ? (
    <DirectionsWalk sx={{ mr: 1 }} />
  ) : paused ? (
    <Pause sx={{ mr: 1 }} />
  ) : (
    <Box
      sx={{
        mr: 1,
        display: 'inline-flex',
        color: 'primary.main'
      }}
    >
      <WalkingFootprints count={1} />
    </Box>
  );

  const label = active
    ? paused
      ? dictionary['journey paused']
      : dictionary['journey in progress']
    : journey && journey.milestones.length > 0
      ? `${dictionary['start journey']} (${journey.milestones.length})`
      : dictionary['start journey'];

  return (
    <MapControl controlPosition={controlPosition}>
      <Box sx={{ p: 2 }}>
        <Fab
          variant="extended"
          color={active ? 'default' : 'secondary'}
          disabled={disabled}
          onClick={handleClick}
          sx={active ? { bgcolor: 'background.paper' } : undefined}
        >
          {icon}
          {label}
        </Fab>
      </Box>
    </MapControl>
  );
}

export default memo(JourneyFab);
