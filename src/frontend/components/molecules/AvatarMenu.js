import React, { useState, useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import Link from './Link';
import Avatar from '@material-ui/core/Avatar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import I18n from '../../utils/I18n';

import getFirebase from '../../utils/getFirebase';
import getFirebaseMessaging from '../../utils/getFirebaseMessaging';
import getFirebaseAuth from '../../utils/getFirebaseAuth';
import signIn from '../../actions/signIn';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';
import { DevicesApi } from 'qoodish_api';
import initializeApiClient from '../../utils/initializeApiClient';
import fetchRegistrationToken from '../../actions/fetchRegistrationToken';

const styles = {
  profileAvatar: {
    width: 35,
    height: 35
  }
};

const AvatarMenu = () => {
  const [anchorEl, setAnchorEl] = useState(undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser,
      history: state.shared.history
    }),
    []
  );
  const { currentUser, history } = useMappedState(mapState);
  const dispatch = useDispatch();

  const handleSignOutClick = useCallback(async () => {
    setMenuOpen(false);

    dispatch(requestStart());
    const firebase = await getFirebase();
    await getFirebaseMessaging();
    await getFirebaseAuth();

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const messaging = firebase.messaging();
      const registrationToken = await messaging.getToken();

      if (registrationToken) {
        await initializeApiClient();
        const apiInstance = new DevicesApi();

        apiInstance.devicesRegistrationTokenDelete(
          registrationToken,
          (error, data, response) => {
            if (response.ok) {
              console.log('Successfully sent registration token.');
              dispatch(fetchRegistrationToken(refreshedToken));
            } else {
              console.log('Failed to send registration token.');
            }
          }
        );
      }
    }

    await firebase.auth().signOut();
    await firebase.auth().signInAnonymously();
    const currentUser = firebase.auth().currentUser;
    const user = {
      uid: currentUser.uid,
      isAnonymous: true
    };
    dispatch(signIn(user));

    history.push('/login');
    dispatch(requestFinish());
  });

  return (
    <div>
      <IconButton
        aria-label="Account"
        aria-owns={menuOpen ? 'account-menu' : null}
        aria-haspopup="true"
        onClick={e => {
          setAnchorEl(e.currentTarget);
          setMenuOpen(true);
        }}
      >
        <Avatar
          src={currentUser ? currentUser.thumbnail_url : ''}
          style={styles.profileAvatar}
        />
      </IconButton>

      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      >
        <MenuItem
          onClick={() => setMenuOpen(false)}
          selected={false}
          component={Link}
          to="/profile"
          title={I18n.t('account')}
        >
          {I18n.t('account')}
        </MenuItem>
        <MenuItem
          onClick={() => setMenuOpen(false)}
          selected={false}
          component={Link}
          to="/settings"
          title={I18n.t('settings')}
        >
          {I18n.t('settings')}
        </MenuItem>
        <MenuItem onClick={handleSignOutClick}>{I18n.t('logout')}</MenuItem>
      </Menu>
    </div>
  );
};

export default React.memo(AvatarMenu);
