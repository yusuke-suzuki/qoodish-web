import { connect } from 'react-redux';
import FollowMapButton from '../ui/FollowMapButton';
import openSignInRequiredDialog from '../actions/openSignInRequiredDialog';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import fetchCollaborators from '../actions/fetchCollaborators';
import ApiClient from './ApiClient';
import joinMap from '../actions/joinMap';
import leaveMap from '../actions/leaveMap';
import openToast from '../actions/openToast';

const mapStateToProps = state => {
  return {
    currentUser: state.app.currentUser
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleFollowButtonClick: async (currentUser) => {
      if (currentUser.isAnonymous) {
        dispatch(openSignInRequiredDialog());
        return;
      }
      dispatch(requestStart());
      const client = new ApiClient();
      let followResponse = await client.followMap(ownProps.currentMap.id);
      dispatch(requestFinish());
      if (followResponse.ok) {
        let map = await followResponse.json();
        dispatch(joinMap(map));
        dispatch(openToast('Followed map successfully!'));

        gtag('event', 'follow', {
          'event_category': 'engagement',
          'event_label': 'map'
        });

        let colloboratorsResponse = await client.fetchCollaborators(
          ownProps.currentMap.id
        );
        let collaborators = await colloboratorsResponse.json();
        dispatch(fetchCollaborators(collaborators));
      } else {
        dispatch(openToast('Failed to follow map'));
      }
    },

    handleUnfollowButtonClick: async () => {
      dispatch(requestStart());
      const client = new ApiClient();
      let response = await client.unfollowMap(ownProps.currentMap.id);
      dispatch(requestFinish());
      if (response.ok) {
        let map = await response.json();
        dispatch(leaveMap(map));
        dispatch(openToast('Unfollowed map successfully'));

        gtag('event', 'unfollow', {
          'event_category': 'engagement',
          'event_label': 'map'
        });

        let colloboratorsResponse = await client.fetchCollaborators(
          ownProps.currentMap.id
        );
        let collaborators = await colloboratorsResponse.json();
        dispatch(fetchCollaborators(collaborators));
      } else {
        dispatch(openToast('Failed to unfollow map'));
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FollowMapButton);
