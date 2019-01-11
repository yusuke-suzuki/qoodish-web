import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Slide from '@material-ui/core/Slide';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ReviewCard from '../../molecules/ReviewCard';
import I18n from '../../../utils/I18n';

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

const DialogAppBar = props => {
  return (
    <AppBar style={styles.appbar} color="primary">
      <Toolbar style={styles.toolbar}>
        <IconButton color="inherit" onClick={props.handleRequestDialogClose}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" color="inherit" style={styles.flex}>
          {I18n.t('report')}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

const ReviewDialog = props => {
  return (
    <Dialog
      open={props.dialogOpen}
      onClose={props.handleRequestDialogClose}
      TransitionComponent={Transition}
      fullWidth
      fullScreen={props.large ? false : true}
      scroll={props.large ? 'body' : 'paper'}
    >
      {!props.large && <DialogAppBar {...props} />}
      <DialogContent style={styles.dialogContent}>
        <div>
          <ReviewCard
            currentReview={props.currentReview}
            detail={!props.large}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
