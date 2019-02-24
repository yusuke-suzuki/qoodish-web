import React, { useCallback } from 'react';
import { useMappedState } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Slide from '@material-ui/core/Slide';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import SpotCard from '../organisms/SpotCard';
import I18n from '../../utils/I18n';

const styles = {
  appbar: {
    position: 'relative'
  },
  toolbar: {
    paddingLeft: 8
  },
  flex: {
    flex: 1
  },
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
  const large = useMediaQuery('(min-width: 600px)');
  const mapState = useCallback(
    state => ({
      dialogOpen: state.spotDetail.spotDialogOpen,
      currentSpot: state.spotDetail.currentSpot,
      history: state.shared.history
    }),
    []
  );
  const { dialogOpen, currentSpot, history } = useMappedState(mapState);

  const handleRequestDialogClose = useCallback(() => {
    history.goBack();
  });

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleRequestDialogClose}
      TransitionComponent={Transition}
      fullWidth
      fullScreen={large ? false : true}
      scroll={large ? 'body' : 'paper'}
    >
      {!large && (
        <AppBar style={styles.appbar} color="primary">
          <Toolbar style={styles.toolbar}>
            <IconButton color="inherit" onClick={handleRequestDialogClose}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" style={styles.flex}>
              {I18n.t('spot')}
            </Typography>
          </Toolbar>
        </AppBar>
      )}
      <DialogContent style={styles.dialogContent}>
        <div>
          {currentSpot && (
            <SpotCard
              currentSpot={currentSpot}
              placeId={currentSpot && currentSpot.place_id}
              dialog={true}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(SpotDialog);
