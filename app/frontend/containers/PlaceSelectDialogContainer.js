import { connect } from 'react-redux';
import PlaceSelectDialog from '../ui/PlaceSelectDialog';
import ApiClient from './ApiClient';
import closePlaceSelectDialog from '../actions/closePlaceSelectDialog';
import selectPlaceForReview from '../actions/selectPlaceForReview';

const mapStateToProps = (state) => {
  return {
    dialogOpen: state.mapDetail.placeSelectDialogOpen
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onRequestClose: () => {
      dispatch(closePlaceSelectDialog());
    },

    onPlaceSelected: (place) => {
      dispatch(selectPlaceForReview(place));
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlaceSelectDialog);
