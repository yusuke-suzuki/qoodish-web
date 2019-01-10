import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import I18n from '../containers/I18n';

const DeleteCommentDialog = props => {
  return (
    <Dialog open={props.dialogOpen} onClose={props.handleRequestDialogClose}>
      <DialogTitle>{I18n.t('delete comment')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {I18n.t('sure to delete comment')}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleRequestDialogClose}>
          {I18n.t('cancel')}
        </Button>
        <Button
          onClick={() => props.handleDeleteButtonClick(props.comment)}
          color="primary"
        >
          {I18n.t('delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteCommentDialog;
