import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import Button from '@material-ui/core/Button';

import openEditProfileDialog from '../../actions/openEditProfileDialog';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';
import I18n from '../../utils/I18n';

const EditProfileButton = () => {
  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser
    }),
    []
  );

  const { currentUser } = useMappedState(mapState);

  const handleEditProfileButtonClick = useCallback(() => {
    if (currentUser.isAnonymous) {
      dispatch(openSignInRequiredDialog());
      return;
    }
    dispatch(openEditProfileDialog());
  });

  return (
    <Button
      variant="outlined"
      onClick={handleEditProfileButtonClick}
      color="primary"
    >
      {I18n.t('edit profile')}
    </Button>
  );
};

export default React.memo(EditProfileButton);
