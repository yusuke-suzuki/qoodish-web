import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import DeleteMapDialog from '../ui/DeleteMapDialog';
import ApiClient from './ApiClient';
import deleteMap from '../actions/deleteMap';
import closeDeleteMapDialog from '../actions/closeDeleteMapDialog';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import { sleep } from './Utils';

const mapStateToProps = (state) => {
  return {
    currentMap: state.maps.targetMap,
    dialogOpen: state.maps.deleteMapDialogOpen
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleRequestDialogClose: () => {
      dispatch(closeDeleteMapDialog());
    },

    handleDeleteButtonClick: async () => {
      dispatch(requestStart());
      const client = new ApiClient;
      await client.deleteMap(ownProps.mapId);
      dispatch(requestFinish());
      dispatch(deleteMap(ownProps.mapId));
      dispatch(closeDeleteMapDialog());
      // 少し待たないと dialog を close した際のエラー (material-ui 起因?) に巻き込まれて遷移できない
      await sleep(1000);
      dispatch(push('/maps'));
      dispatch(openToast('Delete map successfully'));
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DeleteMapDialog);
