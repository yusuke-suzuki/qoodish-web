import React, { memo, useCallback, useContext } from 'react';
import { useDispatch } from 'redux-react-hook';
import openEditProfileDialog from '../../actions/openEditProfileDialog';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';
import I18n from '../../utils/I18n';
import AuthContext from '../../context/AuthContext';
import { Button } from '@material-ui/core';

export default memo(function EditProfileButton() {
  const dispatch = useDispatch();

  const { currentUser } = useContext(AuthContext);

  const handleEditProfileButtonClick = useCallback(() => {
    if (currentUser.isAnonymous) {
      dispatch(openSignInRequiredDialog());
      return;
    }
    dispatch(openEditProfileDialog());
  }, [dispatch, currentUser]);

  return (
    <Button
      variant="outlined"
      onClick={handleEditProfileButtonClick}
      color="primary"
    >
      {I18n.t('edit profile')}
    </Button>
  );
});
