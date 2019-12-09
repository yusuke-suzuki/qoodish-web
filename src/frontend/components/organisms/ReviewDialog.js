import React, { useCallback, useState, useMemo, useEffect } from 'react';
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
import { useDispatch } from 'redux-react-hook';
import closeReviewDialog from '../../actions/closeReviewDialog';
import openReviewDialog from '../../actions/openReviewDialog';

const styles = {
  appbar: {
    position: 'relative'
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

const ReviewDialog = () => {
  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState(undefined);

  const history = useHistory();
  const large = useMediaQuery('(min-width: 600px)');

  const unlisten = useMemo(() => {
    return history.listen(location => {
      const matched = match('/maps/:mapId/reports/:reviewId')(
        location.pathname
      );

      if (matched && location.state && location.state.modal) {
        setCurrentReview(location.state.review);
        setDialogOpen(true);
      } else {
        setDialogOpen(false);
      }
    });
  }, [history]);

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
  }, [currentReview]);

  const handleDialogClose = useCallback(() => {
    dispatch(closeReviewDialog());
    history.goBack();
  }, [history]);

  useEffect(() => {
    return () => {
      unlisten();
    };
  }, [unlisten]);

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
      <DialogActions disableActionSpacing style={styles.dialogActions}>
        <ReviewCardActions review={currentReview} />
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(ReviewDialog);
