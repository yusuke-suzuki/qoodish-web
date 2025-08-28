import { AccountCircle } from '@mui/icons-material';
import { Avatar, type SxProps } from '@mui/material';
import { memo, useMemo } from 'react';
import type { Profile } from '../../../types';

type Props = {
  profile?: Profile | null;
  size?: number;
  variant?: 'rounded' | 'circular' | 'square';
};

function ProfileAvatar({ profile, size, variant }: Props) {
  const avatarStyle = useMemo<SxProps>(() => {
    return size ? { width: size, height: size } : { width: 40, height: 40 };
  }, [size]);

  const iconStyle = useMemo<SxProps>(() => {
    return size ? { fontSize: size } : { fontSize: 40 };
  }, [size]);

  if (!profile) {
    return (
      <Avatar sx={avatarStyle}>
        <AccountCircle sx={iconStyle} />
      </Avatar>
    );
  }
  return (
    <Avatar
      src={profile.thumbnail_url_400}
      alt={profile.name}
      imgProps={{
        loading: 'lazy'
      }}
      sx={avatarStyle}
      variant={variant || 'circular'}
    />
  );
}

export default memo(ProfileAvatar);
