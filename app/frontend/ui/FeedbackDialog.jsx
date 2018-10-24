import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';
import TextField from '@material-ui/core/TextField';

import I18n from '../containers/I18n';

const styles = {
  dialogContent: {
    paddingBottom: 0
  }
};

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class FeedbackDialog extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      feedbackNegative: '',
      feedbackPositive: '',
      errorNegative: undefined,
      errorPositive: undefined,
      disabled: true
    };
    this.handleNegativeChange = this.handleNegativeChange.bind(this);
    this.handlePositiveChange = this.handlePositiveChange.bind(this);
    this.handleSendButtonClick = this.handleSendButtonClick.bind(this);
    this.validate = this.validate.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.dialogOpen) {
      this.clearState();
    }
  }

  clearState() {
    this.setState({
      feedbackNegative: '',
      feedbackPositive: '',
      errorNegative: undefined,
      errorPositive: undefined,
      disabled: true
    });
  }

  handleNegativeChange(e) {
    let feedbackNegative = e.target.value;
    let errorText;
    if (feedbackNegative) {
      if (name.length > 500) {
        errorText = I18n.t('max characters 500');
      } else {
        errorText = null;
      }
    } else {
      errorText = I18n.t('comment is required');
    }

    this.setState(
      {
        feedbackNegative: feedbackNegative,
        errorNegative: errorText
      },
      () => {
        this.validate();
      }
    );
  }

  handlePositiveChange(e) {
    let feedbackPositive = e.target.value;
    let errorText;
    if (feedbackPositive) {
      if (name.length > 500) {
        errorText = I18n.t('max characters 500');
      } else {
        errorText = null;
      }
    } else {
      errorText = I18n.t('comment is required');
    }

    this.setState(
      {
        feedbackPositive: feedbackPositive,
        errorPositive: errorText
      },
      () => {
        this.validate();
      }
    );
  }

  handleSendButtonClick() {
    let params = {
      feedbackPositive: this.state.feedbackPositive,
      feedbackNegative: this.state.feedbackNegative
    };
    this.props.handleSendButtonClick(params);
  }

  validate() {
    let disabled;
    if (
      this.state.feedbackNegative &&
      this.state.feedbackPositive &&
      !this.state.errorNegative &&
      !this.state.errorPositive
    ) {
      disabled = false;
    } else {
      disabled = true;
    }
    this.setState({
      disabled: disabled
    });
  }

  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.props.onClose}
        fullWidth
        TransitionComponent={Transition}
      >
        <DialogTitle>
          {I18n.t('send feedback')}
        </DialogTitle>
        <DialogContent style={styles.dialogContent}>
          {this.renderNegativeText()}
          {this.renderPositiveText()}
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onClose}>
            {I18n.t('cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={this.handleSendButtonClick}
            color="primary"
            disabled={this.state.disabled}
          >
            {I18n.t('save')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderNegativeText() {
    return (
      <TextField
        label={I18n.t('feedback negative')}
        onChange={this.handleNegativeChange}
        error={this.state.errorNegative ? true : false}
        helperText={this.state.errorNegative}
        fullWidth
        autoFocus
        value={this.state.feedbackNegative}
        margin="normal"
        multiline
        rows="4"
        rowsMax="4"
        required
      />
    );
  }

  renderPositiveText() {
    return (
      <TextField
        label={I18n.t('feedback positive')}
        onChange={this.handlePositiveChange}
        error={this.state.errorPositive ? true : false}
        helperText={this.state.errorPositive}
        fullWidth
        value={this.state.feedbackPositive}
        margin="normal"
        multiline
        rows="4"
        rowsMax="4"
        required
      />
    );
  }
}

export default FeedbackDialog;
