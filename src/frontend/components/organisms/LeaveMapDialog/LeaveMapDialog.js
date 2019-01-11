import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';
import I18n from '../../../utils/I18n';

const Transition = props => {
  return <Slide direction="up" {...props} />;
};

const LeaveMapDialog = props => {
  return (
    <Dialog
      open={props.dialogOpen}
      onClose={props.handleRequestDialogClose}
      fullWidth
      TransitionComponent={Transition}
    >
      <DialogTitle>{I18n.t('sure to unfollow map')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{I18n.t('unfollow map detail')}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleCancelButtonClick}>
          {I18n.t('cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={() => props.handleLeaveButtonClick(props.currentMap)}
          color="primary"
        >
          {I18n.t('unfollow')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeaveMapDialog;
