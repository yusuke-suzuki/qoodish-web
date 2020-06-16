import React, { useCallback, useState, useMemo, useEffect } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useHistory } from '@yusuke-suzuki/rize-router';
import { match } from 'path-to-regexp';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Slide from '@material-ui/core/Slide';
import Fade from '@material-ui/core/Fade';

import SpotCard from './SpotCard';
import I18n from '../../utils/I18n';
import DialogAppBar from '../molecules/DialogAppBar';
import closeSpotDialog from '../../actions/closeSpotDialog';
import openSpotDialog from '../../actions/openSpotDialog';
import { useDispatch, useMappedState } from 'redux-react-hook';

const styles = {
  dialogContent: {
    padding: 0
  },
  dialogActions: {
    paddingLeft: 20,
    paddingRight: 12
  }
};

const Transition = React.forwardRef(function Transition(props, ref) {
  const large = useMediaQuery('(min-width: 600px)');
  return <Slide direction={large ? 'up' : 'left'} ref={ref} {...props} />;
});

const SpotDialog = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentSpot, setCurrentSpot] = useState(undefined);

  const dispatch = useDispatch();
  const history = useHistory();
  const large = useMediaQuery('(min-width: 600px)');

  const mapState = useCallback(
    state => ({
      currentLocation: state.shared.currentLocation
    }),
    []
  );

  const { currentLocation } = useMappedState(mapState);

  const isMatched = useMemo(() => {
    const matched = match('/spots/:placeId')(currentLocation.pathname);
    return matched && currentLocation.state && currentLocation.state.modal;
  }, [currentLocation]);

  useEffect(() => {
    if (isMatched) {
      setCurrentSpot(currentLocation.state.spot);
      setDialogOpen(true);
    } else {
      setDialogOpen(false);
    }
  }, [isMatched, currentLocation]);

  const handleDialogOpen = useCallback(() => {
    dispatch(openSpotDialog());

    if (currentSpot) {
      gtag('config', process.env.GA_TRACKING_ID, {
        page_path: `/spots/${currentSpot.place_id}`,
        page_title: `${currentSpot.name} | Qoodish`
      });
    }
  }, [currentSpot]);

  const handleDialogClose = useCallback(() => {
    dispatch(closeSpotDialog());
    history.goBack();
  }, [history]);

  return (
    <Dialog
      open={dialogOpen}
      onEntered={handleDialogOpen}
      onClose={handleDialogClose}
      TransitionComponent={large ? Fade : Transition}
      fullWidth
      fullScreen={large ? false : true}
      scroll={large ? 'body' : 'paper'}
    >
      {!large && (
        <DialogAppBar
          title={I18n.t('spot')}
          iconType="back"
          handleRequestDialogClose={handleDialogClose}
        />
      )}
      <DialogContent style={styles.dialogContent}>
        <div>
          {currentSpot && (
            <SpotCard
              currentSpot={currentSpot}
              placeId={currentSpot.place_id}
              dialog={true}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(SpotDialog);
