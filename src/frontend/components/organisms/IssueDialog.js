import React, { useCallback, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

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

import I18n from '../../utils/I18n';
import ApiClient from '../../utils/ApiClient';
import closeIssueDialog from '../../actions/closeIssueDialog';
import openToast from '../../actions/openToast';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';

const IssueDialog = () => {
  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      dialogOpen: state.shared.issueDialogOpen,
      issueTargetId: state.shared.issueTargetId,
      issueTargetType: state.shared.issueTargetType
    }),
    []
  );
  const { dialogOpen, issueTargetId, issueTargetType } = useMappedState(
    mapState
  );

  const [value, setValue] = useState(undefined);

  const handleRequestDialogClose = useCallback(() => {
    dispatch(closeIssueDialog());
  });

  const handleSendButtonClick = useCallback(async () => {
    let params = {
      content_id: issueTargetId,
      content_type: issueTargetType,
      reason_id: value
    };

    dispatch(requestStart());
    const client = new ApiClient();
    const response = await client.issueContent(params);
    dispatch(requestFinish());
    if (response.ok) {
      dispatch(closeIssueDialog());
      dispatch(openToast('Successfully sent. Thank you!'));
    } else {
      dispatch(openToast('Failed to issue content.'));
    }
  });

  const handleReasonChange = useCallback((e, value) => {
    setValue(value);
  });

  return (
    <Dialog open={dialogOpen} onClose={handleRequestDialogClose} fullWidth>
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
            value={value}
            onChange={handleReasonChange}
          >
            <FormControlLabel
              value="0"
              control={<Radio checked={value == '0'} />}
              label={I18n.t('not interested in')}
            />
            <FormControlLabel
              value="1"
              control={<Radio checked={value == '1'} />}
              label={I18n.t('spam')}
            />
            <FormControlLabel
              value="2"
              control={<Radio checked={value == '2'} />}
              label={I18n.t('sensitive')}
            />
            <FormControlLabel
              value="3"
              control={<Radio checked={value == '3'} />}
              label={I18n.t('abusive or harmful')}
            />
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleRequestDialogClose}>{I18n.t('cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleSendButtonClick}
          color="primary"
        >
          {I18n.t('send')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(IssueDialog);
