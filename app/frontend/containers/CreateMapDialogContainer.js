import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import EditMapDialog from '../ui/EditMapDialog';
import ApiClient from './ApiClient';
import createMap from '../actions/createMap';
import closeCreateMapDialog from '../actions/closeCreateMapDialog';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';

const mapStateToProps = (state) => {
  return {
    dialogOpen: state.dashboard.createMapDialogOpen
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleRequestDialogClose: () => {
      dispatch(closeCreateMapDialog());
    },

    handleSaveButtonClick: async (params) => {
      dispatch(requestStart());
      const client = new ApiClient;
      let response = await client.createMap(params);
      dispatch(requestFinish());
      if (response.ok) {
        let newMap = await response.json();
        dispatch(createMap(newMap));
        dispatch(closeCreateMapDialog());
        dispatch(openToast('Successfuly created the map!'));
        // not working...
        // dispatch(push(`/maps/${newMap.id}`));
      } else if (response.status == 409) {
        dispatch(openToast(e.message));
      } else {
        dispatch(openToast('Failed to create map.'));
      }
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditMapDialog);
