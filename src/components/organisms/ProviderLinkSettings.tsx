import React, { useCallback, useContext, useEffect } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import PersonIcon from '@material-ui/icons/Person';
import Avatar from '@material-ui/core/Avatar';

import openToast from '../../actions/openToast';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';
import updateLinkedProviders from '../../actions/updateLinkedProviders';
import I18n from '../../utils/I18n';
import AuthContext from '../../context/AuthContext';

import firebase from 'firebase/app';
import 'firebase/auth';

const providers = [
  {
    name: 'Google',
    id: 'google.com'
  },
  {
    name: 'Facebook',
    id: 'facebook.com'
  },
  {
    name: 'Twitter',
    id: 'twitter.com'
  },
  {
    name: 'GitHub',
    id: 'github.com'
  }
];

const styles = {
  unlinkButton: {
    color: 'red',
    border: '1px solid red'
  }
};

const LinkedProvidersList = () => {
  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      linkedProviders: state.app.linkedProviders
    }),
    []
  );
  const { linkedProviders } = useMappedState(mapState);

  const { currentUser } = useContext(AuthContext);

  const refreshProviders = useCallback(async () => {
    const linkedProviders = currentUser.providerData.map(provider => {
      return provider.providerId;
    });
    dispatch(updateLinkedProviders(linkedProviders));
  }, [dispatch, currentUser]);

  const handleLinkProviderButtonClick = useCallback(
    async providerId => {
      dispatch(requestStart());

      let provider;
      switch (providerId) {
        case 'google.com':
          provider = new firebase.auth.GoogleAuthProvider();
          break;
        case 'facebook.com':
          provider = new firebase.auth.FacebookAuthProvider();
          break;
        case 'twitter.com':
          provider = new firebase.auth.TwitterAuthProvider();
          break;
        case 'github.com':
          provider = new firebase.auth.GithubAuthProvider();
          break;
      }

      try {
        await currentUser.linkWithPopup(provider);
      } catch (error) {
        console.log(error);
        dispatch(requestFinish());
        dispatch(openToast(error.message, 8000));
        return;
      }

      const linkedProviders = currentUser.providerData.map(provider => {
        return provider.providerId;
      });
      dispatch(updateLinkedProviders(linkedProviders));
      dispatch(requestFinish());
      dispatch(openToast(I18n.t('link provider success')));
    },
    [dispatch, currentUser]
  );

  const handleUnlinkProviderButtonClick = useCallback(
    async providerId => {
      dispatch(requestStart());

      try {
        await currentUser.unlink(providerId);
      } catch (error) {
        console.log(error);
        dispatch(requestFinish());
        dispatch(openToast(error.message, 8000));
        return;
      }

      const linkedProviders = currentUser.providerData.map(provider => {
        return provider.providerId;
      });
      dispatch(updateLinkedProviders(linkedProviders));
      dispatch(requestFinish());
      dispatch(openToast(I18n.t('unlink provider success')));
    },
    [dispatch, currentUser]
  );

  useEffect(() => {
    if (!currentUser || !currentUser.uid || currentUser.isAnonymous) {
      return;
    }
    refreshProviders();
  }, [currentUser]);

  let reachedMinimum = linkedProviders.length === 1;

  return providers.map(provider => {
    let linked = linkedProviders.includes(provider.id);

    return (
      <ListItem disableGutters key={provider.id}>
        <ListItemAvatar>
          <Avatar>
            <PersonIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={provider.name} secondary={provider.id} />
        <ListItemSecondaryAction>
          <Button
            variant="outlined"
            onClick={() => {
              linked
                ? handleUnlinkProviderButtonClick(provider.id)
                : handleLinkProviderButtonClick(provider.id);
            }}
            disabled={currentUser.isAnonymous || (linked && reachedMinimum)}
            color="primary"
            style={linked && !reachedMinimum ? styles.unlinkButton : {}}
          >
            {linked ? I18n.t('unlink') : I18n.t('link')}
          </Button>
        </ListItemSecondaryAction>
      </ListItem>
    );
  });
};

const ProviderLinkSettings = () => {
  return (
    <Card elevation={0}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          {I18n.t('link providers')}
        </Typography>
        <Typography component="p" gutterBottom>
          {I18n.t('link providers detail')}
        </Typography>
        <List>
          <LinkedProvidersList />
        </List>
      </CardContent>
    </Card>
  );
};

export default React.memo(ProviderLinkSettings);
