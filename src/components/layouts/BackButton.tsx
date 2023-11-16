import { ArrowBack } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useRouter } from 'next/router';
import { memo, useCallback } from 'react';

export default memo(function BackButton() {
  const router = useRouter();

  const handleBackButtonClick = useCallback(() => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push('/');
    }
  }, []);

  return (
    <IconButton color="inherit" onClick={handleBackButtonClick} edge="start">
      <ArrowBack />
    </IconButton>
  );
});
