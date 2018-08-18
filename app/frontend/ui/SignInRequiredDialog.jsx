import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';

import LoginButtonsContainer from '../containers/LoginButtonsContainer';
import I18n from '../containers/I18n';

const styles = {
  dialogContent: {
    paddingBottom: 0
  }
};

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class SignInRequiredDialog extends React.PureComponent {
  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.props.onClose}
        fullWidth
        TransitionComponent={Transition}
      >
        <DialogTitle>
          {I18n.t('this action requires sign in')}
        </DialogTitle>
        <DialogContent style={styles.dialogContent}>
          <LoginButtonsContainer />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onClose}>
            {I18n.t('cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default SignInRequiredDialog;
