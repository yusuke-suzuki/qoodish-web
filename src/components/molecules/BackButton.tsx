import React, { useCallback } from 'react';
import switchMap from '../../actions/switchMap';
import { useHistory } from '@yusuke-suzuki/rize-router';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { useTheme, useMediaQuery } from '@material-ui/core';

const BackButton = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));

  const mapState = useCallback(
    state => ({
      mapSummaryOpen: state.mapDetail.mapSummaryOpen,
      historyCount: state.shared.historyCount
    }),
    []
  );
  const { mapSummaryOpen, historyCount } = useMappedState(mapState);

  const handleBackButtonClick = useCallback(() => {
    if (!lgUp && mapSummaryOpen) {
      dispatch(switchMap());
      return;
    }

    if (historyCount > 2) {
      history.goBack();
    } else {
      history.push('/');
    }
  }, [dispatch, history, mapSummaryOpen, historyCount, lgUp]);

  return (
    <IconButton color="inherit" onClick={handleBackButtonClick}>
      <ArrowBackIcon />
    </IconButton>
  );
};

export default React.memo(BackButton);
