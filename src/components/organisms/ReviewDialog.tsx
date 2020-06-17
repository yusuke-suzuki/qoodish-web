import React, { useCallback, useState, useEffect, useMemo } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useHistory } from '@yusuke-suzuki/rize-router';
import { match } from 'path-to-regexp';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Slide from '@material-ui/core/Slide';
import Fade from '@material-ui/core/Fade';

import ReviewCard from '../molecules/ReviewCard';
import ReviewCardActions from '../molecules/ReviewCardActions';
import I18n from '../../utils/I18n';
import DialogAppBar from '../molecules/DialogAppBar';

import requestMapCenter from '../../actions/requestMapCenter';
import { useDispatch, useMappedState } from 'redux-react-hook';
import closeReviewDialog from '../../actions/closeReviewDialog';
import openReviewDialog from '../../actions/openReviewDialog';
import selectReview from '../../actions/selectReview';
import clearReviewState from '../../actions/clearReviewState';

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

const ReviewDialog = () => {
  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const mapState = useCallback(
    state => ({
      currentReview: state.reviews.currentReview,
      currentLocation: state.shared.currentLocation
    }),
    []
  );

  const { currentReview, currentLocation } = useMappedState(mapState);

  const history = useHistory();
  const large = useMediaQuery('(min-width: 600px)');

  const isMatched = useMemo(() => {
    const matched = match('/maps/:mapId/reports/:reviewId')(
      currentLocation.pathname
    );
    return matched && currentLocation.state && currentLocation.state.modal;
  }, [currentLocation]);

  useEffect(() => {
    if (isMatched) {
      dispatch(selectReview(currentLocation.state.review));
      setDialogOpen(true);
    } else {
      setDialogOpen(false);
    }
  }, [isMatched, currentLocation]);

  const handleDialogOpen = useCallback(() => {
    dispatch(openReviewDialog());

    if (currentReview) {
      gtag('config', process.env.GA_TRACKING_ID, {
        page_path: `/maps/${currentReview.map.id}/reports/${currentReview.id}`,
        page_title: `${currentReview.spot.name} - ${currentReview.map.name} | Qoodish`
      });

      dispatch(
        requestMapCenter(currentReview.spot.lat, currentReview.spot.lng)
      );
    }
  }, [dispatch, currentReview]);

  const handleDialogClose = useCallback(() => {
    dispatch(closeReviewDialog());
    history.goBack();
  }, [dispatch, history]);

  const handleDialogExited = useCallback(() => {
    dispatch(clearReviewState());
  }, [dispatch]);

  return (
    <Dialog
      disableScrollLock
      open={dialogOpen}
      onEntered={handleDialogOpen}
      onClose={handleDialogClose}
      onExited={handleDialogExited}
      TransitionComponent={large ? Fade : Transition}
      fullWidth
      fullScreen={large ? false : true}
      scroll={large ? 'body' : 'paper'}
      disableRestoreFocus
    >
      {!large && (
        <DialogAppBar
          title={I18n.t('report')}
          iconType="back"
          handleRequestDialogClose={handleDialogClose}
        />
      )}
      <DialogContent style={styles.dialogContent}>
        <div>
          {currentReview && (
            <ReviewCard
              currentReview={currentReview}
              detail={!large}
              hideActions
            />
          )}
        </div>
      </DialogContent>
      <DialogActions disableSpacing style={styles.dialogActions}>
        <ReviewCardActions review={currentReview} />
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(ReviewDialog);
