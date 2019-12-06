import React, { useCallback, useState, useMemo, useEffect } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useHistory } from '@yusuke-suzuki/rize-router';
import { match } from 'path-to-regexp';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Slide from '@material-ui/core/Slide';
import Fade from '@material-ui/core/Fade';

import SpotCard from '../organisms/SpotCard';
import I18n from '../../utils/I18n';
import DialogAppBar from '../molecules/DialogAppBar';

const styles = {
  dialogContent: {
    padding: 0
  },
  dialogActions: {
    paddingLeft: 20,
    paddingRight: 12
  }
};

const Transition = props => {
  const large = useMediaQuery('(min-width: 600px)');
  return <Slide direction={large ? 'up' : 'left'} {...props} />;
};

const SpotDialog = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentSpot, setCurrentSpot] = useState(undefined);

  const history = useHistory();
  const large = useMediaQuery('(min-width: 600px)');

  const unlisten = useMemo(() => {
    return history.listen(location => {
      const matched = match('/spots/:placeId')(location.pathname);

      if (matched && location.state && location.state.modal) {
        setCurrentSpot(location.state.spot);
        setDialogOpen(true);
      } else {
        setDialogOpen(false);
      }
    });
  }, [history]);

  useEffect(() => {
    return () => {
      unlisten();
    };
  }, [unlisten]);

  if (dialogOpen && currentSpot) {
    gtag('config', process.env.GA_TRACKING_ID, {
      page_path: `/spots/${currentSpot.place_id}`,
      page_title: `${currentSpot.name} | Qoodish`
    });
  }

  const handleRequestDialogClose = useCallback(() => {
    history.goBack();
  });

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleRequestDialogClose}
      TransitionComponent={large ? Fade : Transition}
      fullWidth
      fullScreen={large ? false : true}
      scroll={large ? 'body' : 'paper'}
    >
      {!large && (
        <DialogAppBar
          title={I18n.t('spot')}
          iconType="back"
          handleRequestDialogClose={handleRequestDialogClose}
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
