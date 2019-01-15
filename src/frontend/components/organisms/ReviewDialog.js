import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Slide from '@material-ui/core/Slide';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import ReviewCard from '../molecules/ReviewCard';
import I18n from '../../utils/I18n';
import closeReviewDialog from '../../actions/closeReviewDialog';

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
  }
};

const Transition = props => {
  return <Slide direction="up" {...props} />;
};

const ReviewDialog = () => {
  const dispatch = useDispatch();
  const large = useMediaQuery('(min-width: 600px)');
  const mapState = useCallback(
    state => ({
      dialogOpen: state.reviews.reviewDialogOpen,
      currentReview: state.reviews.currentReview
    }),
    []
  );
  const { dialogOpen, currentReview } = useMappedState(mapState);

  const handleRequestDialogClose = useCallback(() => {
    dispatch(closeReviewDialog());
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
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" style={styles.flex}>
              {I18n.t('report')}
            </Typography>
          </Toolbar>
        </AppBar>
      )}
      <DialogContent style={styles.dialogContent}>
        <div>
          <ReviewCard currentReview={currentReview} detail={!large} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(ReviewDialog);
