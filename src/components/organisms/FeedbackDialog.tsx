import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';
import TextField from '@material-ui/core/TextField';

import I18n from '../../utils/I18n';
import closeFeedbackDialog from '../../actions/closeFeedbackDialog';
import openToast from '../../actions/openToast';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';
import getFirebase from '../../utils/getFirebase';
import getFirestore from '../../utils/getFirestore';

const styles = {
  dialogContent: {
    paddingBottom: 0
  }
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FeedbackDialog = () => {
  const dispatch = useDispatch();

  const mapState = useCallback(state => state.shared.feedbackDialogOpen, []);
  const dialogOpen = useMappedState(mapState);

  const [feedbackNegative, setFeedbackNegative] = useState('');
  const [feedbackPositive, setFeedbackPositive] = useState('');
  const [errorNegative, setErrorNegative] = useState(undefined);
  const [errorPositive, setErrorPositive] = useState(undefined);
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    if (
      feedbackNegative &&
      feedbackPositive &&
      !errorNegative &&
      !errorPositive
    ) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [feedbackNegative, feedbackPositive]);

  const handleRequestDialogClose = useCallback(() => {
    dispatch(closeFeedbackDialog());
  }, [dispatch]);

  const clearState = useCallback(() => {
    setFeedbackNegative('');
    setFeedbackPositive('');
    setErrorNegative(undefined);
    setErrorPositive(undefined);
    setDisabled(true);
  }, []);

  const handleNegativeChange = useCallback(input => {
    if (input) {
      if (input.length > 500) {
        setErrorNegative(I18n.t('max characters 500'));
      } else {
        setErrorNegative(undefined);
      }
    } else {
      setErrorNegative(I18n.t('comment is required'));
    }
    setFeedbackNegative(input);
  }, []);

  const handlePositiveChange = useCallback(input => {
    if (input) {
      if (input.length > 500) {
        setErrorPositive(I18n.t('max characters 500'));
      } else {
        setErrorPositive(undefined);
      }
    } else {
      setErrorPositive(I18n.t('comment is required'));
    }
    setFeedbackPositive(input);
  }, []);

  const handleSendButtonClick = useCallback(async () => {
    let params = {
      feedbackPositive: feedbackPositive,
      feedbackNegative: feedbackNegative
    };

    dispatch(requestStart());
    const firebase = await getFirebase();
    await getFirestore();

    const firestore = firebase.firestore();
    await firestore.collection('feedbacks').add({
      negative: params.feedbackNegative,
      positive: params.feedbackPositive
    });

    dispatch(closeFeedbackDialog());
    dispatch(requestFinish());
    dispatch(openToast(I18n.t('send feedback success')));
  }, [dispatch]);

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleRequestDialogClose}
      onExited={clearState}
      fullWidth
      TransitionComponent={Transition}
    >
      <DialogTitle>{I18n.t('send feedback')}</DialogTitle>
      <DialogContent style={styles.dialogContent}>
        <TextField
          label={I18n.t('feedback negative')}
          onChange={e => handleNegativeChange(e.target.value)}
          error={errorNegative ? true : false}
          helperText={errorNegative}
          fullWidth
          autoFocus
          value={feedbackNegative}
          margin="normal"
          multiline
          rows="4"
          rowsMax="4"
          required
        />
        <TextField
          label={I18n.t('feedback positive')}
          onChange={e => handlePositiveChange(e.target.value)}
          error={errorPositive ? true : false}
          helperText={errorPositive}
          fullWidth
          value={feedbackPositive}
          margin="normal"
          multiline
          rows="4"
          rowsMax="4"
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleRequestDialogClose}>{I18n.t('cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleSendButtonClick}
          color="primary"
          disabled={disabled}
        >
          {I18n.t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(FeedbackDialog);
