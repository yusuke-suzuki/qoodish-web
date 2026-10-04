import { Close } from '@mui/icons-material';
import { Box, IconButton, Paper } from '@mui/material';
import {
  type KeyboardEvent,
  memo,
  type ReactNode,
  useEffect,
  useRef,
  useState
} from 'react';
import { createPortal } from 'react-dom';
import useDictionary from '../../hooks/useDictionary.ts';
import { useGoogleMap } from '../../hooks/useGoogleMap.ts';

const ARROW_SIZE = 16;

type Props = {
  children: ReactNode;
  label: string;
  position: google.maps.LatLng | null;
  open: boolean;
  onClose: () => void;
};

function MapPopup({ children, label, position, open, onClose }: Props) {
  const dictionary = useDictionary();
  const { googleMap, loader } = useGoogleMap();

  const [content, setContent] = useState<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setContent(document.createElement('div'));
  }, []);

  useEffect(() => {
    if (!loader || !content) {
      return;
    }

    let cancelled = false;

    const isolateFromMap = async () => {
      const { OverlayView } = await loader.importLibrary('maps');

      if (cancelled) {
        return;
      }

      OverlayView.preventMapHitsAndGesturesFrom(content);
    };

    isolateFromMap();

    return () => {
      cancelled = true;
    };
  }, [loader, content]);

  useEffect(() => {
    if (!googleMap || !loader || !content || !position || !open) {
      return;
    }

    let cancelled = false;
    let marker: google.maps.marker.AdvancedMarkerElement | null = null;

    const showPopup = async () => {
      const { AdvancedMarkerElement } = await loader.importLibrary('marker');

      if (cancelled) {
        return;
      }

      marker = new AdvancedMarkerElement({
        map: googleMap,
        position,
        content,
        zIndex: Number.MAX_SAFE_INTEGER
      });
    };

    const previouslyFocused = document.activeElement;

    const focusWhenShown = new IntersectionObserver(([entry], observer) => {
      if (entry?.isIntersecting) {
        closeButtonRef.current?.focus({ preventScroll: true });
        observer.disconnect();
      }
    });
    focusWhenShown.observe(content);

    showPopup();

    return () => {
      cancelled = true;
      focusWhenShown.disconnect();

      if (
        content.contains(document.activeElement) &&
        previouslyFocused instanceof HTMLElement
      ) {
        previouslyFocused.focus({ preventScroll: true });
      }

      if (marker) {
        marker.map = null;
      }
    };
  }, [googleMap, loader, content, position, open]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  if (!content) {
    return null;
  }

  return createPortal(
    <Box sx={{ pb: `${ARROW_SIZE / Math.SQRT2}px` }}>
      <Paper
        role="dialog"
        aria-label={label}
        elevation={3}
        onKeyDown={handleKeyDown}
        sx={{ position: 'relative', px: 2, pt: 1, pb: 2 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mr: -1 }}>
          <IconButton
            ref={closeButtonRef}
            size="small"
            aria-label={dictionary.close}
            onClick={onClose}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
        {children}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            bottom: -ARROW_SIZE / 2,
            width: ARROW_SIZE,
            height: ARROW_SIZE,
            transform: 'translateX(-50%) rotate(45deg)',
            backgroundColor: 'inherit',
            backgroundImage: 'inherit'
          }}
        />
      </Paper>
    </Box>,
    content
  );
}

export default memo(MapPopup);
