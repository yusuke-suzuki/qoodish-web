import { useMediaQuery, useTheme } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import {
  type MutableRefObject,
  memo,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import type { AppMap, Review } from '../../../types';
import ProfileContext from '../../context/ProfileContext';
import { useGoogleMap } from '../../hooks/useGoogleMap';
import CreateReviewDialog from '../reviews/CreateReviewDialog';
import CurrentPositionMarker from './CurrentPositionMarker';
import CustomMapControls from './CustomMapControls';
import PlaceInfoWindow from './PlaceInfoWindow';
import PositionInfoWindow from './PositionInfoWindow';
import ReviewMarker from './ReviewMarker';
import ReviewPopover from './ReviewPopover';

type Props = {
  map: AppMap | null;
  reviews: Review[];
  milestoneOrders: Map<number, number>;
  checkedInReviewIds: Set<number>;
  onReviewSaved: () => void;
  onReviewClick: (review: Review) => void;
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
  reviews,
  milestoneOrders,
  checkedInReviewIds,
  onReviewSaved,
  onReviewClick
}: Props) {
  const { googleMap, currentPosition } = useGoogleMap();

  const profile = useContext(ProfileContext);

  const { replace } = useRouter();
  const pathname = usePathname();

  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const [currentBounds, setCurrentBounds] =
    useState<google.maps.LatLngBounds | null>(null);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  const [popoverAnchorEl, setPopoverAnchorEl] =
    useState<HTMLButtonElement | null>(null);
  const [createReviewDialogOpen, setCreateReviewDialogOpen] = useState(false);
  const [currentPlace, setCurrentPlace] =
    useState<google.maps.places.Place | null>(null);
  const [pinnedPosition, setPinnedPosition] =
    useState<google.maps.LatLng | null>(null);

  const filteredReviews = currentBounds
    ? reviews.filter((review) =>
        positionInBounds(
          { lat: review.latitude, lng: review.longitude },
          currentBounds
        )
      )
    : [];

  const handleReviewDeleted = () => {
    setCurrentReview(null);
    setPopoverAnchorEl(null);
    onReviewSaved();
  };

  const handleReviewClick = (
    review: Review,
    ref: MutableRefObject<HTMLButtonElement>
  ) => {
    setCurrentReview(review);
    onReviewClick(review);

    setPopoverAnchorEl(ref.current);
  };

  const handleCreateReviewOpen = () => {
    setCreateReviewDialogOpen(true);
  };

  const handleCreateReviewClose = () => {
    setCreateReviewDialogOpen(false);
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

  const reviewPopoverId =
    popoverOpen && currentReview
      ? `review-popover-${currentReview.id}`
      : undefined;

  return (
    <>
      <CurrentPositionMarker
        profile={profile}
        disableCreateReview={!map || !map.editable}
        onCreateReviewClick={handleCreateReviewOpen}
      />

      {filteredReviews.map((review) => (
        <ReviewMarker
          key={review.id}
          review={review}
          milestone={
            milestoneOrders.has(review.id)
              ? checkedInReviewIds.has(review.id)
                ? 'visited'
                : 'planned'
              : undefined
          }
          onClick={handleReviewClick}
        />
      ))}

      {mdUp && (
        <ReviewPopover
          currentReview={currentReview}
          anchorEl={popoverAnchorEl}
          popoverId={reviewPopoverId}
          popoverOpen={popoverOpen}
          onPopoverClose={handlePopoverClose}
          onSaved={onReviewSaved}
          onDeleted={handleReviewDeleted}
        />
      )}

      <PlaceInfoWindow
        place={currentPlace}
        disableCreateReview={!map || !map.editable}
        onCreateReviewClick={handleCreateReviewOpen}
        onClose={handlePlaceClose}
      />

      <PositionInfoWindow
        position={pinnedPosition}
        disableCreateReview={!map || !map.editable}
        onCreateReviewClick={handleCreateReviewOpen}
        onClose={handlePinnedPositionClose}
      />

      <CustomMapControls onPlaceChange={setCurrentPlace} />

      <CreateReviewDialog
        open={createReviewDialogOpen}
        onClose={handleCreateReviewClose}
        map={map}
        place={currentPlace}
        currentPosition={currentPosition}
        pinnedPosition={pinnedPosition}
        onSaved={onReviewSaved}
      />
    </>
  );
}

export default memo(CustomOverlays);
