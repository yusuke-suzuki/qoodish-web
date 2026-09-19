import { useMediaQuery, useTheme } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import {
  type MutableRefObject,
  memo,
  useEffect,
  useRef,
  useState
} from 'react';
import type { AppMap, Pin } from '../../../types/index.ts';
import { useGoogleMap } from '../../hooks/useGoogleMap.ts';
import ProfileBoundary from '../common/ProfileBoundary.tsx';
import CreatePinDialog from '../pins/CreatePinDialog.tsx';
import CurrentPositionMarker from './CurrentPositionMarker.tsx';
import CustomMapControls from './CustomMapControls.tsx';
import PinMarker from './PinMarker.tsx';
import PinPopover from './PinPopover.tsx';
import PlaceInfoWindow from './PlaceInfoWindow.tsx';
import PositionInfoWindow from './PositionInfoWindow.tsx';

type Props = {
  map: AppMap | null;
  pins: Pin[];
  milestoneOrders: Map<number, number>;
  checkedInPinIds: Set<number>;
  onPinSaved: () => void;
  onPinClick: (pin: Pin) => void;
};

function positionInBounds(
  position: google.maps.LatLngLiteral,
  bounds: google.maps.LatLngBounds
): boolean {
  if (!position) {
    return false;
  }

  const southWest = bounds.getSouthWest();
  const northEast = bounds.getNorthEast();

  return (
    position.lat > southWest.lat() &&
    position.lng > southWest.lng() &&
    position.lat < northEast.lat() &&
    position.lng < northEast.lng()
  );
}

function CustomOverlays({
  map,
  pins,
  milestoneOrders,
  checkedInPinIds,
  onPinSaved,
  onPinClick
}: Props) {
  const { googleMap, currentPosition } = useGoogleMap();

  const { replace } = useRouter();
  const pathname = usePathname();

  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const [currentBounds, setCurrentBounds] =
    useState<google.maps.LatLngBounds | null>(null);
  const [currentPin, setCurrentPin] = useState<Pin | null>(null);
  const [popoverAnchorEl, setPopoverAnchorEl] =
    useState<HTMLButtonElement | null>(null);
  const [createPinDialogOpen, setCreatePinDialogOpen] = useState(false);
  const [currentPlace, setCurrentPlace] =
    useState<google.maps.places.Place | null>(null);
  const [pinnedPosition, setPinnedPosition] =
    useState<google.maps.LatLng | null>(null);

  const filteredPins = currentBounds
    ? pins.filter((pin) =>
        positionInBounds(
          { lat: pin.latitude, lng: pin.longitude },
          currentBounds
        )
      )
    : [];

  const handlePinDeleted = () => {
    setCurrentPin(null);
    setPopoverAnchorEl(null);
    onPinSaved();
  };

  const handlePinClick = (
    pin: Pin,
    ref: MutableRefObject<HTMLButtonElement>
  ) => {
    setCurrentPin(pin);
    onPinClick(pin);

    setPopoverAnchorEl(ref.current);
  };

  const handleCreatePinOpen = () => {
    setCreatePinDialogOpen(true);
  };

  const handleCreatePinClose = () => {
    setCreatePinDialogOpen(false);
  };

  const handlePlaceClose = () => {
    setCurrentPlace(null);
  };

  const handlePinnedPositionClose = () => {
    setPinnedPosition(null);
  };

  const handlePopoverClose = () => {
    setPopoverAnchorEl(null);
  };

  useEffect(() => {
    if (!googleMap) {
      return;
    }

    const handleIdle = () => {
      const bounds = googleMap.getBounds();

      if (bounds) {
        setCurrentBounds(bounds);
      }
    };

    const handleMapClick = (
      event: google.maps.MapMouseEvent | google.maps.IconMouseEvent
    ) => {
      if ('placeId' in event) {
        // Prevent POI Click Events
        event.stop();
      }
    };

    const handleMapRightClick = (
      event: google.maps.MapMouseEvent | google.maps.IconMouseEvent
    ) => {
      setPinnedPosition(event.latLng);
    };

    const idleListener = googleMap.addListener('idle', handleIdle);
    const clickListener = googleMap.addListener('click', handleMapClick);
    const rightCickListener = googleMap.addListener(
      'rightclick',
      handleMapRightClick
    );

    return () => {
      idleListener.remove();
      clickListener.remove();
      rightCickListener.remove();
    };
  }, [googleMap]);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!googleMap || !map) return;
    if (initializedRef.current) return;

    initializedRef.current = true;
    replace(`${pathname}?lat=${map.latitude}&lng=${map.longitude}&zoom=17`, {
      scroll: false
    });
  }, [googleMap, map, pathname, replace]);

  // `replace` triggers an RSC refetch that hands down a freshly fetched `map`
  // object, so keying this effect on `map` alone would re-run it forever.
  // Track the place the URL was last synced to and skip repeats.
  const lastSyncedPlaceRef = useRef<google.maps.places.Place | null>(null);

  useEffect(() => {
    if (!googleMap || !map || !currentPlace) return;
    if (lastSyncedPlaceRef.current === currentPlace) return;

    lastSyncedPlaceRef.current = currentPlace;
    replace(
      `${pathname}?lat=${currentPlace.location.lat()}&lng=${currentPlace.location.lng()}&zoom=17`,
      { scroll: false }
    );
  }, [googleMap, map, currentPlace, pathname, replace]);

  const popoverOpen = Boolean(popoverAnchorEl);

  const pinPopoverId =
    popoverOpen && currentPin ? `pin-popover-${currentPin.id}` : undefined;

  return (
    <>
      <ProfileBoundary>
        {(profile) => (
          <CurrentPositionMarker
            profile={profile}
            disableCreatePin={!map?.editable}
            onCreatePinClick={handleCreatePinOpen}
          />
        )}
      </ProfileBoundary>

      {filteredPins.map((pin) => (
        <PinMarker
          key={pin.id}
          pin={pin}
          milestone={
            milestoneOrders.has(pin.id)
              ? checkedInPinIds.has(pin.id)
                ? 'visited'
                : 'planned'
              : undefined
          }
          onClick={handlePinClick}
        />
      ))}

      {mdUp && (
        <PinPopover
          currentPin={currentPin}
          anchorEl={popoverAnchorEl}
          popoverId={pinPopoverId}
          popoverOpen={popoverOpen}
          onPopoverClose={handlePopoverClose}
          onSaved={onPinSaved}
          onDeleted={handlePinDeleted}
        />
      )}

      <PlaceInfoWindow
        place={currentPlace}
        disableCreatePin={!map?.editable}
        onCreatePinClick={handleCreatePinOpen}
        onClose={handlePlaceClose}
      />

      <PositionInfoWindow
        position={pinnedPosition}
        disableCreatePin={!map?.editable}
        onCreatePinClick={handleCreatePinOpen}
        onClose={handlePinnedPositionClose}
      />

      <CustomMapControls onPlaceChange={setCurrentPlace} />

      <CreatePinDialog
        open={createPinDialogOpen}
        onClose={handleCreatePinClose}
        map={map}
        place={currentPlace}
        currentPosition={currentPosition}
        pinnedPosition={pinnedPosition}
        onSaved={onPinSaved}
      />
    </>
  );
}

export default memo(CustomOverlays);
