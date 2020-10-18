import { memo, useCallback, useContext } from 'react';
import { useMappedState } from 'redux-react-hook';

import ProfileAvatar from './ProfileAvatar';
import { IconButton } from '@material-ui/core';
import DrawerContext from '../../context/DrawerContext';

export default memo(function AppMenuButton() {
  const { setDrawerOpen } = useContext(DrawerContext);

  const handleButtonClick = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const mapState = useCallback(
    state => ({
      profile: state.app.profile
    }),
    []
  );
  const { profile } = useMappedState(mapState);

  return (
    <IconButton onClick={handleButtonClick}>
      <ProfileAvatar size={35} profile={profile} />
    </IconButton>
  );
});
