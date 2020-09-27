import React, { memo, useCallback, useContext } from 'react';
import { useMappedState } from 'redux-react-hook';

import IconButton from '@material-ui/core/IconButton';

import ProfileAvatar from './ProfileAvatar';
import { createStyles, makeStyles } from '@material-ui/core';
import DrawerContext from '../../context/DrawerContext';

const useStyles = makeStyles(() =>
  createStyles({
    iconButton: {
      width: 48,
      height: 48
    },
    avatarContainer: {
      position: 'absolute'
    }
  })
);

export default memo(function AppMenuButton() {
  const classes = useStyles();
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
    <IconButton onClick={handleButtonClick} className={classes.iconButton}>
      <div className={classes.avatarContainer}>
        <ProfileAvatar size={35} profile={profile} />
      </div>
    </IconButton>
  );
});
