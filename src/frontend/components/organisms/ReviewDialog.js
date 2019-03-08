import React, { useCallback } from 'react';
import { useMappedState } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Slide from '@material-ui/core/Slide';

import ReviewCard from '../molecules/ReviewCard';
import ReviewCardActions from '../molecules/ReviewCardActions';
import I18n from '../../utils/I18n';
import DialogAppBar from '../molecules/DialogAppBar';

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
  const large = useMediaQuery('(min-width: 600px)');
  const mapState = useCallback(
    state => ({
      dialogOpen: state.reviews.reviewDialogOpen,
      currentReview: state.reviews.currentReview,
      history: state.shared.history
    }),
    []
  );
  const { dialogOpen, currentReview, history } = useMappedState(mapState);

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
        <DialogAppBar
          title={I18n.t('report')}
          iconType="back"
          handleRequestDialogClose={handleRequestDialogClose}
        />
      )}
      <DialogContent style={styles.dialogContent}>
        <div>
          <ReviewCard
            currentReview={currentReview}
            detail={!large}
            hideActions
          />
        </div>
      </DialogContent>
      <DialogActions disableActionSpacing style={styles.dialogActions}>
        <ReviewCardActions review={currentReview} />
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(ReviewDialog);
