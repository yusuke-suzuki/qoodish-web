import { AccountCircle } from '@mui/icons-material';
import { Avatar } from '@mui/material';
import { memo } from 'react';
import type { ImageVariants } from '../../../types';

type Props = {
  profile?: { name: string; image: ImageVariants | null } | null;
  size?: number;
  variant?: 'rounded' | 'circular' | 'square';
};

function ProfileAvatar({ profile, size, variant }: Props) {
  const avatarStyle = size
    ? { width: size, height: size }
    : { width: 40, height: 40 };

  const iconStyle = size ? { fontSize: size } : { fontSize: 40 };

  if (!profile) {
    return (
      <Avatar sx={avatarStyle}>
        <AccountCircle sx={iconStyle} />
      </Avatar>
    );
  }
  return (
    <Avatar
      src={profile.image?.card}
      alt={profile.name}
      sx={avatarStyle}
      variant={variant || 'circular'}
      slotProps={{
        img: {
          loading: 'lazy'
        }
      }}
    />
  );
}

export default memo(ProfileAvatar);
