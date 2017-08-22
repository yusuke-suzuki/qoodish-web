import { connect } from 'react-redux';
import JoinMapDialog from '../ui/JoinMapDialog';
import ApiClient from './ApiClient';
import joinMap from '../actions/joinMap';
import closeJoinMapDialog from '../actions/closeJoinMapDialog';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import fetchCollaborators from '../actions/fetchCollaborators';

const mapStateToProps = (state) => {
  return {
    dialogOpen: state.mapDetail.joinMapDialogOpen
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleCancelButtonClick: () => {
      dispatch(closeJoinMapDialog());
    },

    handleRequestDialogClose: () => {
      dispatch(closeJoinMapDialog());
    },

    handleJoinButtonClick: async () => {
      dispatch(requestStart());
      const client = new ApiClient;
      let followResponse = await client.followMap(ownProps.mapId);
      dispatch(requestFinish());
      if (followResponse.ok) {
        dispatch(closeJoinMapDialog());
        let map = await followResponse.json();
        dispatch(joinMap(map));
        dispatch(openToast('Joined map successfully!'));
        let colloboratorsResponse = await client.fetchCollaborators(ownProps.mapId)
        let collaborators = await colloboratorsResponse.json();
        dispatch(fetchCollaborators(collaborators));
      } else {
        dispatch(openToast('Failed to join map'));
      }
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(JoinMapDialog);
