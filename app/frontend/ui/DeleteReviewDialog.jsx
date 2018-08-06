import React, { Component } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import I18n from '../containers/I18n';

class DeleteReviewDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      check: false,
      disabled: true
    };
    this.handleCheckChange = this.handleCheckChange.bind(this);
    this.handleRequestDialogClose = this.handleRequestDialogClose.bind(this);
  }

  handleRequestDialogClose() {
    this.setState({
      check: false,
      disabled: true
    }, () => {
      this.props.handleRequestDialogClose();
    });
  }

  handleCheckChange() {
    this.setState({
      check: !this.state.check,
      disabled: !this.state.disabled
    });
  }

  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.handleRequestDialogClose}
        fullWidth
      >
        <DialogTitle>
          {I18n.t('sure to delete report')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{I18n.t('this cannot be undone')}</DialogContentText>
          <br />
          <FormControlLabel
            control={
              <Checkbox
                checked={this.state.check}
                onChange={this.handleCheckChange}
              />
            }
            label={I18n.t('understand this cannot be undone')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleRequestDialogClose}>{I18n.t('cancel')}</Button>
          <Button
            variant="raised"
            onClick={() => {
              this.props.handleDeleteButtonClick(this.props.currentReview);
              this.handleRequestDialogClose();
            }}
            color="primary"
            disabled={this.state.disabled}
          >
            {I18n.t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default DeleteReviewDialog;
