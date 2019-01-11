import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Invites from './Invites';
import ApiClient from '../../../utils/ApiClient';
import openToast from '../../../actions/openToast';
import requestStart from '../../../actions/requestStart';
import requestFinish from '../../../actions/requestFinish';
import fetchInvites from '../../../actions/fetchInvites';
import loadInvitesStart from '../../../actions/loadInvitesStart';
import loadInvitesEnd from '../../../actions/loadInvitesEnd';
import I18n from '../../../utils/I18n';

const mapStateToProps = state => {
  return {
    currentUser: state.app.currentUser,
    large: state.shared.large,
    invites: state.invites.invites,
    loadingInvites: state.invites.loadingInvites
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchInvites: async () => {
      dispatch(loadInvitesStart());
      const client = new ApiClient();
      const response = await client.fetchInvites();
      dispatch(loadInvitesEnd());
      if (response.ok) {
        let invites = await response.json();
        dispatch(fetchInvites(invites));
      } else {
        dispatch(openToast('Failed to fetch invites'));
      }
    },

    handleFollowButtonClick: async invite => {
      dispatch(requestStart());
      const client = new ApiClient();
      const response = await client.followMap(invite.invitable.id, invite.id);
      dispatch(requestFinish());
      if (response.ok) {
        dispatch(openToast(I18n.t('follow map success')));
        ownProps.history.push(`/maps/${invite.invitable.id}`);
        gtag('event', 'follow', {
          event_category: 'engagement',
          event_label: 'map'
        });
      } else {
        dispatch(openToast('Failed to follow map'));
      }
    }
  };
};

export default React.memo(
  withRouter(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(Invites)
  )
);
