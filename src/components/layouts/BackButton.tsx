import { ArrowBack } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useRouter } from 'next/router';
import { memo, useCallback } from 'react';

export default memo(function BackButton() {
  const { back, push } = useRouter();

  const handleBackButtonClick = useCallback(() => {
    if (window.history.length > 2) {
      back();
    } else {
      push('/');
    }
  }, [back, push]);

  return (
    <IconButton color="inherit" onClick={handleBackButtonClick} edge="start">
      <ArrowBack />
    </IconButton>
  );
});
