import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import I18n from '../containers/I18n';

class DeleteMapDialog extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      check: false,
      disabled: true
    };
    this.handleCheckChange = this.handleCheckChange.bind(this);
    this.handleRequestDialogClose = this.handleRequestDialogClose.bind(this);
  }

  handleCheckChange() {
    this.setState({
      check: !this.state.check,
      disabled: !this.state.disabled
    });
  }

  handleRequestDialogClose() {
    this.setState({
      check: false,
      disabled: true
    }, () => {
      this.props.handleRequestDialogClose();
    });
  }

  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.handleRequestDialogClose}
        fullWidth
      >
        <DialogTitle>{I18n.t('sure to delete map')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {I18n.t('delete map detail')}
          </DialogContentText>
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
              this.props.handleDeleteButtonClick();
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

export default DeleteMapDialog;
