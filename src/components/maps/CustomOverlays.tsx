import { useMediaQuery, useTheme } from '@mui/material';
import { useRouter } from 'next/router';
import {
  type MutableRefObject,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import type { AppMap, Review } from '../../../types';
import AuthContext from '../../context/AuthContext';
import { useGoogleMap } from '../../hooks/useGoogleMap';
import { useProfile } from '../../hooks/useProfile';
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

function CustomOverlays({ map, reviews, onReviewSaved, onReviewClick }: Props) {
  const { googleMap, currentPosition } = useGoogleMap();

  const { currentUser } = useContext(AuthContext);
  const { profile } = useProfile(currentUser ? currentUser.uid : null);

  const { replace, query } = useRouter();

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

  const filteredReviews = useMemo(() => {
    if (!currentBounds) {
      return [];
    }

    return reviews.filter((review) =>
      positionInBounds(
        { lat: review.latitude, lng: review.longitude },
        currentBounds
      )
    );
  }, [reviews, currentBounds]);

  const handleReviewDeleted = useCallback(() => {
    setCurrentReview(null);
    setPopoverAnchorEl(null);
    onReviewSaved();
  }, [onReviewSaved]);

  const handleReviewClick = useCallback(
    (review: Review, ref: MutableRefObject<HTMLButtonElement>) => {
      setCurrentReview(review);
      onReviewClick(review);

      setPopoverAnchorEl(ref.current);
    },
    [onReviewClick]
  );

  const handleMapClick = useCallback(
    async (event: google.maps.MapMouseEvent | google.maps.IconMouseEvent) => {
      if ('placeId' in event) {
        // Prevent POI Click Events
        event.stop();
      }
    },
    []
  );

  const handleMapRightClick = useCallback(
    async (event: google.maps.MapMouseEvent | google.maps.IconMouseEvent) => {
      setPinnedPosition(event.latLng);
    },
    []
  );

  const handleIdle = useCallback(() => {
    if (!googleMap) {
      return;
    }

    const bounds = googleMap.getBounds();

    if (bounds) {
      setCurrentBounds(bounds);
    }
  }, [googleMap]);

  useEffect(() => {
    if (!googleMap) {
      return;
    }

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
  }, [googleMap, handleIdle, handleMapClick, handleMapRightClick]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: query and replace are intentionally omitted to prevent infinite loops.
  useEffect(() => {
    if (!googleMap || !map) return;

    replace(
      {
        query: {
          ...query,
          lat: map.latitude,
          lng: map.longitude,
          zoom: 17
        }
      },
      undefined,
      { shallow: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleMap, map]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: query and replace are intentionally omitted to prevent infinite loops.
  useEffect(() => {
    if (!googleMap || !currentPlace) return;

    replace(
      {
        query: {
          ...query,
          lat: currentPlace.location.lat(),
          lng: currentPlace.location.lng(),
          zoom: 17
        }
      },
      undefined,
      { shallow: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleMap, currentPlace]);

  const popoverOpen = Boolean(popoverAnchorEl);

  const reviewPopoverId = useMemo(() => {
    return popoverOpen && currentReview
      ? `review-popover-${currentReview.id}`
      : undefined;
  }, [popoverOpen, currentReview]);

  return (
    <>
      <CurrentPositionMarker
        profile={profile}
        disableCreateReview={!map || !map.postable}
        onCreateReviewClick={() => setCreateReviewDialogOpen(true)}
      />

      {filteredReviews.map((review) => (
        <ReviewMarker
          key={review.id}
          review={review}
          onClick={handleReviewClick}
        />
      ))}

      {mdUp && (
        <ReviewPopover
          currentReview={currentReview}
          anchorEl={popoverAnchorEl}
          popoverId={reviewPopoverId}
          popoverOpen={popoverOpen}
          onPopoverClose={() => setPopoverAnchorEl(null)}
          onDeleted={handleReviewDeleted}
        />
      )}

      <PlaceInfoWindow
        place={currentPlace}
        disableCreateReview={!map || !map.postable}
        onCreateReviewClick={() => setCreateReviewDialogOpen(true)}
        onClose={() => setCurrentPlace(null)}
      />

      <PositionInfoWindow
        position={pinnedPosition}
        disableCreateReview={!map || !map.postable}
        onCreateReviewClick={() => setCreateReviewDialogOpen(true)}
        onClose={() => setPinnedPosition(null)}
      />

      <CustomMapControls onPlaceChange={setCurrentPlace} />

      <CreateReviewDialog
        open={createReviewDialogOpen}
        onClose={() => setCreateReviewDialogOpen(false)}
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
