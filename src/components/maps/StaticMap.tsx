import { ButtonBase, Card, CardMedia, Skeleton } from '@mui/material';
import { memo } from 'react';

type Props = {
  position: google.maps.LatLngLiteral | null;
  width: number;
  height: number;
};

function StaticMap({ position, width, height }: Props) {
  if (!position) {
    return <Skeleton variant="rectangular" width={width} height={height} />;
  }

  return (
    <Card elevation={0}>
      <ButtonBase
        component="a"
        href={`https://www.google.com/maps/search/?api=1&query=${position.lat},${position.lng}`}
        target="_blank"
        rel="noreferrer"
      >
        <CardMedia
          component="img"
          image={`https://maps.googleapis.com/maps/api/staticmap?center=${position.lat},${position.lng}&markers=color:red|${position.lat},${position.lng}&zoom=15&size=${width}x${height}&scale=2&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
          width={width}
          height={height}
          loading="lazy"
          sx={{
            objectFit: 'cover',
            width: '100%',
            height: '100%'
          }}
        />
      </ButtonBase>
    </Card>
  );
}

export default memo(StaticMap);
