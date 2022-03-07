import { memo, useCallback } from 'react';
import switchMap from '../../actions/switchMap';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { useTheme, useMediaQuery, IconButton } from '@material-ui/core';
import { useRouter } from 'next/router';
import { ArrowBack } from '@material-ui/icons';

export default memo(function BackButton() {
  const router = useRouter();
  const dispatch = useDispatch();
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));

  const mapState = useCallback(
    state => ({
      mapSummaryOpen: state.mapDetail.mapSummaryOpen
    }),
    []
  );
  const { mapSummaryOpen } = useMappedState(mapState);

  const handleBackButtonClick = useCallback(() => {
    if (!lgUp && mapSummaryOpen) {
      dispatch(switchMap());
      return;
    }

    if (window.history.length > 2) {
      router.back();
    } else {
      router.push('/');
    }
  }, [dispatch, router, mapSummaryOpen, lgUp]);

  return (
    <IconButton color="inherit" onClick={handleBackButtonClick} edge="start">
      <ArrowBack />
    </IconButton>
  );
});
