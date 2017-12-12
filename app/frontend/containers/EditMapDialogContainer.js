import { connect } from 'react-redux';
import EditMapDialog from '../ui/EditMapDialog';
import ApiClient from './ApiClient';
import editMap from '../actions/editMap';
import closeEditMapDialog from '../actions/closeEditMapDialog';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';

const mapStateToProps = (state) => {
  return {
    dialogOpen: state.maps.editMapDialogOpen,
    currentMap: state.maps.targetMap
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleRequestDialogClose: () => {
      dispatch(closeEditMapDialog());
    },

    handleSaveButtonClick: async (params) => {
      dispatch(requestStart());
      const client = new ApiClient;
      let response = await client.editMap(params);
      dispatch(requestFinish());
      if (response.ok) {
        let map = await response.json();
        dispatch(editMap(map));
        dispatch(closeEditMapDialog());
        dispatch(openToast('Successfuly updated the map!'));
      } else if (response.status == 409) {
        dispatch(openToast(e.message));
      } else {
        dispatch(openToast('Failed to update map.'));
      }
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditMapDialog);
