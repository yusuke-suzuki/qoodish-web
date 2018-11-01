import React from 'react';
import { connect } from 'react-redux';
import FeedbackDialog from '../ui/FeedbackDialog';
import closeFeedbackDialog from '../actions/closeFeedbackDialog';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import I18n from './I18n';
import firebase from 'firebase/app';
import 'firebase/firestore';

const mapStateToProps = state => {
  return {
    dialogOpen: state.shared.feedbackDialogOpen
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onClose: () => {
      dispatch(closeFeedbackDialog());
    },

    handleSendButtonClick: async (params) => {
      dispatch(requestStart());

      const firestore = firebase.firestore();
      const settings = {
        timestampsInSnapshots: true
      };
      firestore.settings(settings);
      await firestore.collection('feedbacks').add({
        negative: params.feedbackNegative,
        positive: params.feedbackPositive
      });

      dispatch(closeFeedbackDialog());
      dispatch(requestFinish());
      dispatch(openToast(I18n.t('send feedback success')));
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(FeedbackDialog));
