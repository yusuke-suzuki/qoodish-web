import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';
import I18n from '../containers/I18n';

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class LeaveMapDialog extends React.PureComponent {
  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.props.handleRequestDialogClose}
        fullWidth
        TransitionComponent={Transition}
      >
        <DialogTitle>{I18n.t('sure to unfollow map')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {I18n.t('unfollow map detail')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.handleCancelButtonClick}>{I18n.t('cancel')}</Button>
          <Button
            variant="raised"
            onClick={this.props.handleLeaveButtonClick}
            color="primary"
          >
            {I18n.t('unfollow')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
 export default LeaveMapDialog;
