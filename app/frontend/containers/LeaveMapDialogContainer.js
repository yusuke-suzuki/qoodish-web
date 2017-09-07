import { connect } from 'react-redux';
import LeaveMapDialog from '../ui/LeaveMapDialog';
import ApiClient from './ApiClient';
import leaveMap from '../actions/leaveMap';
import closeLeaveMapDialog from '../actions/closeLeaveMapDialog';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import fetchCollaborators from '../actions/fetchCollaborators';

const mapStateToProps = (state) => {
  return {
    dialogOpen: state.mapDetail.leaveMapDialogOpen
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleCancelButtonClick: () => {
      dispatch(closeLeaveMapDialog());
    },

    handleRequestDialogClose: () => {
      dispatch(closeLeaveMapDialog());
    },

    handleLeaveButtonClick: async () => {
      dispatch(requestStart());
      const client = new ApiClient;
      let response = await client.unfollowMap(ownProps.mapId);
      dispatch(requestFinish());
      if (response.ok) {
        dispatch(closeLeaveMapDialog());
        let map = await response.json();
        dispatch(leaveMap(map));
        dispatch(openToast('Left map successfully'));
        let colloboratorsResponse = await client.fetchCollaborators(ownProps.mapId)
        let collaborators = await colloboratorsResponse.json();
        dispatch(fetchCollaborators(collaborators));
      } else {
        dispatch(openToast('Failed to leave map'));
      }
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LeaveMapDialog);
