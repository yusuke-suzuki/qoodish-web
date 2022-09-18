import React, { forwardRef, useCallback } from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Slide, { SlideProps } from '@material-ui/core/Slide';
import Fade from '@material-ui/core/Fade';

import ReviewCard from '../molecules/ReviewCard';
import ReviewCardActions from '../molecules/ReviewCardActions';
import DialogAppBar from '../molecules/DialogAppBar';

import { useDispatch, useMappedState } from 'redux-react-hook';
import { useTheme, useMediaQuery, makeStyles } from '@material-ui/core';
import closeReviewDialog from '../../actions/closeReviewDialog';
import { useEffect } from 'react';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles(theme => ({
  dialogContent: {
    padding: 0
  },
  dialogActions: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  }
}));

const Transition = forwardRef(function Transition(props: SlideProps, ref) {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  return <Slide direction={smUp ? 'up' : 'left'} ref={ref} {...props} />;
});

const ReviewDialog = () => {
  const mapState = useCallback(
    state => ({
      currentReview: state.reviews.currentReview,
      reviewDialogOpen: state.reviews.reviewDialogOpen
    }),
    []
  );
  const { currentReview, reviewDialogOpen } = useMappedState(mapState);

  const dispatch = useDispatch();
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const classes = useStyles();
  const { I18n } = useLocale();

  const handleDialogClose = useCallback(() => {
    dispatch(closeReviewDialog());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      handleDialogClose();
    };
  }, []);

  return (
    <Dialog
      disableScrollLock
      open={reviewDialogOpen}
      onClose={handleDialogClose}
      TransitionComponent={smUp ? Fade : Transition}
      fullWidth
      fullScreen={smUp ? false : true}
      scroll={smUp ? 'body' : 'paper'}
      disableRestoreFocus
    >
      {!smUp ? (
        <DialogAppBar
          title={I18n.t('report')}
          iconType="back"
          handleRequestDialogClose={handleDialogClose}
        />
      ) : (
        <div />
      )}
      <DialogContent className={classes.dialogContent}>
        <div>
          {currentReview && (
            <ReviewCard currentReview={currentReview} hideActions />
          )}
        </div>
      </DialogContent>
      <DialogActions disableSpacing className={classes.dialogActions}>
        <ReviewCardActions review={currentReview} />
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(ReviewDialog);
