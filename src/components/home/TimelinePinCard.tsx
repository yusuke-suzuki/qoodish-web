'use client';

import { Comment } from '@mui/icons-material';
import {
  Card,
  CardActions,
  CardContent,
  IconButton,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { Pin } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import ProfileBoundary from '../common/ProfileBoundary.tsx';
import LikePinButton from '../pins/LikePinButton.tsx';
import PinCardHeader from '../pins/PinCardHeader.tsx';
import PinImageList from '../pins/PinImageList.tsx';
import PinMenuButton from '../pins/PinMenuButton.tsx';

type Props = {
  pin: Pin;
  onReportClick: (pin: Pin) => void;
};

export default memo(function TimelinePinCard({ pin, onReportClick }: Props) {
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  return (
    <Card>
      <PinCardHeader
        pin={pin}
        action={
          <ProfileBoundary>
            {(profile) => (
              <PinMenuButton
                pin={pin}
                currentProfile={profile}
                onReportClick={onReportClick}
              />
            )}
          </ProfileBoundary>
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {pin.name}
        </Typography>

        <Typography component="p" gutterBottom>
          {pin.comment}
        </Typography>

        {pin.images.length > 0 && <PinImageList pin={pin} />}
      </CardContent>
      <CardActions>
        <LikePinButton pin={pin} />

        <IconButton
          LinkComponent={Link}
          href={localePath(`/pins/${pin.id}`)}
          title={dictionary.comment}
          aria-label={dictionary.comment}
        >
          <Comment />
        </IconButton>
      </CardActions>
    </Card>
  );
});
