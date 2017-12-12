import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import EditMapDialog from '../ui/EditMapDialog';
import ApiClient from './ApiClient';
import selectMap from  '../actions/selectMap';
import createMap from '../actions/createMap';
import closeCreateMapDialog from '../actions/closeCreateMapDialog';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';

const mapStateToProps = (state) => {
  return {
    dialogOpen: state.maps.createMapDialogOpen
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
        dispatch(selectMap(newMap));
        dispatch(push(`/maps/${newMap.id}`));
        dispatch(openToast('Successfuly created the map!'));
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
