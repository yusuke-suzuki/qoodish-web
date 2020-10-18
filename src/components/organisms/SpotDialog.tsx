import React, { forwardRef, useCallback } from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Slide from '@material-ui/core/Slide';
import Fade from '@material-ui/core/Fade';

import SpotCard from './SpotCard';
import I18n from '../../utils/I18n';
import DialogAppBar from '../molecules/DialogAppBar';
import closeSpotDialog from '../../actions/closeSpotDialog';
import { useDispatch, useMappedState } from 'redux-react-hook';
import {
  useMediaQuery,
  useTheme,
  SlideProps,
  makeStyles,
  createStyles
} from '@material-ui/core';

const useStyles = makeStyles(() =>
  createStyles({
    dialogContent: {
      padding: 0
    }
  })
);

const Transition = forwardRef(function Transition(props: SlideProps, ref) {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  return <Slide direction={smUp ? 'up' : 'left'} ref={ref} {...props} />;
});

const SpotDialog = () => {
  const mapState = useCallback(
    state => ({
      currentSpot: state.spotDetail.currentSpot,
      spotDialogOpen: state.spotDetail.spotDialogOpen
    }),
    []
  );

  const { currentSpot, spotDialogOpen } = useMappedState(mapState);

  const dispatch = useDispatch();

  const classes = useStyles();
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const handleDialogClose = useCallback(() => {
    dispatch(closeSpotDialog());
  }, [dispatch]);

  return (
    <Dialog
      open={spotDialogOpen}
      onClose={handleDialogClose}
      TransitionComponent={smUp ? Fade : Transition}
      fullWidth
      fullScreen={smUp ? false : true}
      scroll={smUp ? 'body' : 'paper'}
    >
      {smUp ? (
        <div />
      ) : (
        <DialogAppBar
          title={I18n.t('spot')}
          iconType="back"
          handleRequestDialogClose={handleDialogClose}
        />
      )}
      <DialogContent className={classes.dialogContent}>
        <div>
          {currentSpot && (
            <SpotCard
              currentSpot={currentSpot}
              placeId={currentSpot.place_id}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(SpotDialog);
