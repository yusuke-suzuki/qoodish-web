import { connect } from 'react-redux';
import Invites from '../ui/Invites';
import updatePageTitle from '../actions/updatePageTitle';
import ApiClient from './ApiClient';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import fetchInvites from '../actions/fetchInvites';
import loadInvitesStart from '../actions/loadInvitesStart';
import loadInvitesEnd from '../actions/loadInvitesEnd';
import { push } from 'react-router-redux';
import I18n from './I18n';

const mapStateToProps = state => {
  return {
    currentUser: state.app.currentUser,
    large: state.shared.large,
    invites: state.invites.invites,
    loadingInvites: state.invites.loadingInvites
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updatePageTitle: () => {
      dispatch(updatePageTitle(I18n.t('invites')));
    },

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

    handleFollowButtonClick: async (invite) => {
      dispatch(requestStart());
      const client = new ApiClient();
      const response = await client.followMap(invite.invitable.id, invite.id);
      dispatch(requestFinish());
      if (response.ok) {
        dispatch(openToast('Followed map successfully!'));
        dispatch(push(`/maps/${invite.invitable.id}`, {
          previous: true
        }));
        gtag('event', 'follow', {
          'event_category': 'engagement',
          'event_label': 'map'
        });
      } else {
        dispatch(openToast('Failed to follow map'));
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Invites);
