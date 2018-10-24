import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import I18n from '../containers/I18n';

class IssueDialog extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      value: '0'
    };
    this.handleReasonChange = this.handleReasonChange.bind(this);
    this.handleSendButtonClick = this.handleSendButtonClick.bind(this);
  }

  handleReasonChange(e, value) {
    this.setState({
      value: value
    });
  }

  handleSendButtonClick() {
    let params = {
      content_id: this.props.issueTargetId,
      content_type: this.props.issueTargetType,
      reason_id: this.state.value
    };
    this.props.handleSendButtonClick(params);
  }

  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.props.handleRequestDialogClose}
        fullWidth
      >
        <DialogTitle>{I18n.t('report inappropriate content')}</DialogTitle>
        <DialogContent>
          <FormControl required>
            <FormLabel focused>
              {I18n.t('report inappropriate content detail')}
            </FormLabel>
            <br />
            <RadioGroup
              aria-label="issueReason"
              name="issueReason"
              value={this.state.value}
              onChange={this.handleReasonChange}
            >
              <FormControlLabel
                value="0"
                control={<Radio checked={this.state.value == '0'} />}
                label={I18n.t('not interested in')}
              />
              <FormControlLabel
                value="1"
                control={<Radio checked={this.state.value == '1'} />}
                label={I18n.t('spam')}
              />
              <FormControlLabel
                value="2"
                control={<Radio checked={this.state.value == '2'} />}
                label={I18n.t('sensitive')}
              />
              <FormControlLabel
                value="3"
                control={<Radio checked={this.state.value == '3'} />}
                label={I18n.t('abusive or harmful')}
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.handleCancelButtonClick}>{I18n.t('cancel')}</Button>
          <Button variant="contained" onClick={this.handleSendButtonClick} color="primary">
            {I18n.t('send')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default IssueDialog;
