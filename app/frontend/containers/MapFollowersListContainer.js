import { connect } from 'react-redux';
import MapFollowersList from '../ui/MapFollowersList';
import fetchCollaborators from '../actions/fetchCollaborators';
import ApiClient from './ApiClient';

const mapStateToProps = state => {
  return {
    followers: state.mapSummary.followers
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchFollowers: async () => {
      const client = new ApiClient();
      let response = await client.fetchCollaborators(
        ownProps.mapId
      );
      if (response.ok) {
        let followers = await response.json();
        dispatch(fetchCollaborators(followers));
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MapFollowersList);
