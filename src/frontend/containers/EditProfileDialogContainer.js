import React from 'react';
import { connect } from 'react-redux';
import EditProfileDialog from '../ui/EditProfileDialog';
import ApiClient from './ApiClient';
import fetchMyProfile from '../actions/fetchMyProfile';
import closeEditProfileDialog from '../actions/closeEditProfileDialog';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import uploadToStorage from '../utils/uploadToStorage';
import sleep from '../utils/sleep';
import I18n from './I18n';

const mapStateToProps = state => {
  return {
    dialogOpen: state.profile.editProfileDialogOpen,
    currentUser: state.app.currentUser,
    large: state.shared.large
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
        const uploadResponse = await uploadToStorage(
          params.image_url,
          'profile',
          'data_url'
        );
        params.image_url = uploadResponse.imageUrl;
      }

      const client = new ApiClient();
      let response = await client.editProfile(params);
      let json = await response.json();
      dispatch(requestFinish());
      if (response.ok) {
        dispatch(closeEditProfileDialog());
        dispatch(openToast(I18n.t('edit profile success')));
        // wait until thumbnail created on cloud function
        await sleep(5000);
        dispatch(fetchMyProfile(json));
      } else if (response.status == 409) {
        dispatch(openToast(json.detail));
      } else {
        dispatch(openToast('Failed to update profile.'));
      }
    }
  };
};

export default React.memo(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(EditProfileDialog)
);
