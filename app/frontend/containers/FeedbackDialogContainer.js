import { connect } from 'react-redux';
import FeedbackDialog from '../ui/FeedbackDialog';
import closeFeedbackDialog from '../actions/closeFeedbackDialog';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import I18n from './I18n';

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

    handleSendButtonClick: (params) => {
      dispatch(requestStart());

      dispatch(requestFinish());
      dispatch(openToast(I18n.t('send feedback success')));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackDialog);
