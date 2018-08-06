import { connect } from 'react-redux';
import EditMapDialog from '../ui/EditMapDialog';
import ApiClient from './ApiClient';
import editMap from '../actions/editMap';
import closeEditMapDialog from '../actions/closeEditMapDialog';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import openBaseSelectDialog from '../actions/openBaseSelectDialog';
import I18n from './I18n';

const mapStateToProps = state => {
  return {
    dialogOpen: state.maps.editMapDialogOpen,
    currentMap: state.maps.targetMap,
    large: state.shared.large,
    selectedBase: state.maps.selectedBase
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleRequestDialogClose: () => {
      dispatch(closeEditMapDialog());
    },

    handleMapBaseClick: () => {
      dispatch(openBaseSelectDialog());
    },

    handleSaveButtonClick: async params => {
      dispatch(requestStart());
      const client = new ApiClient();
      let response = await client.editMap(params);
      let json = await response.json();
      dispatch(requestFinish());
      if (response.ok) {
        dispatch(editMap(json));
        dispatch(closeEditMapDialog());
        dispatch(openToast(I18n.t('edit map success')));
      } else if (response.status == 409) {
        dispatch(openToast(json.detail));
      } else {
        dispatch(openToast('Failed to update map.'));
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditMapDialog);
