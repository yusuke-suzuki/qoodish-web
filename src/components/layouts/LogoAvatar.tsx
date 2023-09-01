import { Avatar } from '@mui/material';
import { memo } from 'react';

export default memo(function LogoAvatar() {
  return (
    <Avatar
      sx={{
        fontFamily: "'Lobster', cursive",
        fontWeight: 800,
        fontSize: '1.4rem',
        bgcolor: 'primary.main',
        color: 'white',
        width: 30,
        height: 30
      }}
    >
      Q
    </Avatar>
  );
});
