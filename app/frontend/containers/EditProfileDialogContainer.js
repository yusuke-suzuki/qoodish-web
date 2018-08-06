import { connect } from 'react-redux';
import EditProfileDialog from '../ui/EditProfileDialog';
import ApiClient from './ApiClient';
import fetchMyProfile from '../actions/fetchMyProfile';
import closeEditProfileDialog from '../actions/closeEditProfileDialog';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import { uploadToStorage } from './Utils';

const mapStateToProps = state => {
  return {
    dialogOpen: state.profile.editProfileDialogOpen,
    currentUser: state.app.currentUser,
    large: state.shared.large,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleRequestDialogClose: () => {
      dispatch(closeEditProfileDialog());
    },

    handleSaveButtonClick: async params => {
      dispatch(requestStart());

      if (params.image_url) {
        const uploadResponse = await uploadToStorage(params.image_url, 'profile', 'data_url');
        params.image_url = uploadResponse.imageUrl;
      }

      const client = new ApiClient();
      let response = await client.editProfile(params);
      let json = await response.json();
      dispatch(requestFinish());
      if (response.ok) {
        dispatch(fetchMyProfile(json));
        dispatch(closeEditProfileDialog());
        dispatch(openToast('Successfully updated your profile!'));
      } else if (response.status == 409) {
        dispatch(openToast(json.detail));
      } else {
        dispatch(openToast('Failed to update profile.'));
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditProfileDialog);
