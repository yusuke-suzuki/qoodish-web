import React from 'react';
import { connect } from 'react-redux';
import InviteTargetDialog from './InviteTargetDialog';
import ApiClient from '../../../utils/ApiClient';
import closeInviteTargetDialog from '../../../actions/closeInviteTargetDialog';
import fetchUsers from '../../../actions/fetchUsers';
import loadUsersStart from '../../../actions/loadUsersStart';
import loadUsersEnd from '../../../actions/loadUsersEnd';
import requestStart from '../../../actions/requestStart';
import requestFinish from '../../../actions/requestFinish';
import openToast from '../../../actions/openToast';
import I18n from '../../../utils/I18n';

const mapStateToProps = state => {
  return {
    dialogOpen: state.mapDetail.inviteTargetDialogOpen,
    users: state.mapDetail.pickedUsers,
    loadingUsers: state.mapDetail.loadingUsers,
    large: state.shared.large
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClose: () => {
      dispatch(closeInviteTargetDialog());
    },

    handleSendButtonClick: async userId => {
      dispatch(requestStart());
      const client = new ApiClient();
      const response = await client.sendInvite(ownProps.mapId, userId);
      dispatch(requestFinish());
      if (response.ok) {
        dispatch(closeInviteTargetDialog());
        dispatch(openToast(I18n.t('send invitation success')));
      } else {
        dispatch(openToast('Failed to send invites'));
      }
    },

    handleInputChange: async input => {
      dispatch(loadUsersStart());
      const client = new ApiClient();
      let response = await client.fetchUsers(input);
      let users = await response.json();
      dispatch(loadUsersEnd());
      if (response.ok) {
        dispatch(fetchUsers(users));
      }
    }
  };
};

export default React.memo(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(InviteTargetDialog)
);
