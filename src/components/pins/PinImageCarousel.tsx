import { Box, ButtonBase, CardMedia, Stack } from '@mui/material';
import { memo, useRef, useState } from 'react';
import type { Pin } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';

type Props = {
  pin: Pin;
};

function PinImageCarousel({ pin }: Props) {
  const dictionary = useDictionary();
  const { images } = pin;

  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    const track = trackRef.current;

    if (track && track.clientWidth > 0) {
      setActiveIndex(Math.round(track.scrollLeft / track.clientWidth));
    }
  };

  const scrollToImage = (index: number) => {
    const track = trackRef.current;

    track?.scrollTo({ left: index * track.clientWidth });
  };

  if (images.length < 1) {
    return null;
  }

  return (
    <Box
      role="region"
      aria-roledescription="carousel"
      aria-label={dictionary.photos}
    >
      <Box
        ref={trackRef}
        onScroll={handleScroll}
        tabIndex={0}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          overscrollBehaviorX: 'contain',
          scrollbarWidth: 'none',
          '@media (prefers-reduced-motion: no-preference)': {
            scrollBehavior: 'smooth'
          }
        }}
      >
        {images.map((image, index) => (
          <Box
            key={image.id}
            role="group"
            aria-roledescription="slide"
            aria-label={dictionary['photo position']
              .replace('{index}', String(index + 1))
              .replace('{count}', String(images.length))}
            sx={{ flex: '0 0 100%', scrollSnapAlign: 'start' }}
          >
            <CardMedia
              component="img"
              alt={pin.name}
              image={image.card}
              width={1200}
              height={630}
              loading={index > 0 ? 'lazy' : undefined}
              sx={{ height: 168 }}
            />
          </Box>
        ))}
      </Box>

      {images.length > 1 && (
        <Stack direction="row" sx={{ justifyContent: 'center' }}>
          {images.map((image, index) => (
            <ButtonBase
              key={image.id}
              focusRipple
              onClick={() => scrollToImage(index)}
              aria-label={dictionary['show photo'].replace(
                '{index}',
                String(index + 1)
              )}
              aria-current={index === activeIndex}
              sx={{ width: 24, height: 24, borderRadius: '50%' }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor:
                    index === activeIndex ? 'primary.main' : 'action.disabled'
                }}
              />
            </ButtonBase>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default memo(PinImageCarousel);
