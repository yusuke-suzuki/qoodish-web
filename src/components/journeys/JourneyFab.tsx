import { DirectionsWalk } from '@mui/icons-material';
import { Box, Fab } from '@mui/material';
import { memo, useCallback, useContext, useEffect, useState } from 'react';
import type { Journey } from '../../../types';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import { useGoogleMap } from '../../hooks/useGoogleMap';
import WalkingFootprints from '../common/WalkingFootprints';
import MapControl from '../maps/MapControl';
import StartJourneyDialog from './StartJourneyDialog';

type Props = {
  disabled: boolean;
  journey: Journey | null;
  onStart: () => Promise<boolean>;
  onOpenProgress: () => void;
};

function JourneyFab({ disabled, journey, onStart, onOpenProgress }: Props) {
  const dictionary = useDictionary();
  const { googleMap, loader } = useGoogleMap();
  const { authenticated, setSignInRequired } = useContext(AuthContext);

  const [controlPosition, setControlPosition] =
    useState<google.maps.ControlPosition | null>(null);

  useEffect(() => {
    if (!googleMap || !loader) {
      return;
    }

    (async () => {
      const { ControlPosition } = await loader.importLibrary('core');

      setControlPosition(ControlPosition.BOTTOM_CENTER);
    })();
  }, [googleMap, loader]);

  const [startDialogOpen, setStartDialogOpen] = useState(false);

  const active = Boolean(journey?.started_at && !journey?.finished_at);

  const handleClick = useCallback(() => {
    if (active) {
      onOpenProgress();
      return;
    }

    if (!authenticated) {
      setSignInRequired(true);
      return;
    }

    setStartDialogOpen(true);
  }, [active, onOpenProgress, authenticated, setSignInRequired]);

  const handleStartConfirm = useCallback(async () => {
    const started = await onStart();

    if (started) {
      setStartDialogOpen(false);
    }
  }, [onStart]);

  return (
    <>
      <MapControl controlPosition={controlPosition}>
        <Box sx={{ p: 2 }}>
          <Fab
            variant="extended"
            color={active ? 'default' : 'secondary'}
            disabled={disabled}
            onClick={handleClick}
            sx={active ? { bgcolor: 'background.paper' } : undefined}
          >
            {active ? (
              <Box
                sx={{
                  mr: 1,
                  display: 'inline-flex',
                  color: 'primary.main'
                }}
              >
                <WalkingFootprints count={1} />
              </Box>
            ) : (
              <DirectionsWalk sx={{ mr: 1 }} />
            )}
            {active
              ? dictionary['journey in progress']
              : journey && journey.milestones.length > 0
                ? `${dictionary['start journey']} (${journey.milestones.length})`
                : dictionary['start journey']}
          </Fab>
        </Box>
      </MapControl>

      <StartJourneyDialog
        open={startDialogOpen}
        onClose={() => setStartDialogOpen(false)}
        onConfirm={handleStartConfirm}
      />
    </>
  );
}

export default memo(JourneyFab);
