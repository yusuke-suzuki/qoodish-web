import { connect } from 'react-redux';
import FollowMapButton from '../ui/FollowMapButton';
import openSignInRequiredDialog from '../actions/openSignInRequiredDialog';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import fetchCollaborators from '../actions/fetchCollaborators';
import ApiClient from './ApiClient';
import joinMap from '../actions/joinMap';
import openToast from '../actions/openToast';
import openLeaveMapDialog from '../actions/openLeaveMapDialog';

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
      dispatch(openLeaveMapDialog());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FollowMapButton);
