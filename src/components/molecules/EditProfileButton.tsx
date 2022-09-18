import React, { memo, useCallback, useContext } from 'react';
import { useDispatch } from 'redux-react-hook';
import openEditProfileDialog from '../../actions/openEditProfileDialog';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';
import AuthContext from '../../context/AuthContext';
import { Button } from '@material-ui/core';
import { useLocale } from '../../hooks/useLocale';

export default memo(function EditProfileButton() {
  const dispatch = useDispatch();
  const { I18n } = useLocale();

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
