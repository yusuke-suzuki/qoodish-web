import React, { useCallback, useContext, useEffect } from 'react';
import { useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import DeleteAccountDialog from '../organisms/DeleteAccountDialog';
import CreateResourceButton from '../molecules/CreateResourceButton';
import PushSettings from '../organisms/PushSettings';
import ProviderLinkSettings from '../organisms/ProviderLinkSettings';

import openDeleteAccountDialog from '../../actions/openDeleteAccountDialog';
import updateMetadata from '../../actions/updateMetadata';
import I18n from '../../utils/I18n';
import AuthContext from '../../context/AuthContext';
import { useTheme } from '@material-ui/core';

const styles = {
  card: {
    marginBottom: 20
  },
  deleteButton: {
    color: 'white',
    backgroundColor: 'red'
  }
};

const DeleteAccountCard = () => {
  const dispatch = useDispatch();

  const { currentUser } = useContext(AuthContext);

  const handleDeleteAccountButtonClick = useCallback(async () => {
    dispatch(openDeleteAccountDialog());
  }, [dispatch]);

  return (
    <Card style={styles.card} elevation={0}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          {I18n.t('delete account')}
        </Typography>
        <Typography component="p">{I18n.t('this cannot be undone')}</Typography>
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          onClick={handleDeleteAccountButtonClick}
          style={
            currentUser && currentUser.isAnonymous ? {} : styles.deleteButton
          }
          disabled={currentUser && currentUser.isAnonymous}
        >
          {I18n.t('delete account')}
        </Button>
      </CardActions>
    </Card>
  );
};

const Settings = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  useEffect(() => {
    const metadata = {
      title: `${I18n.t('settings')} | Qoodish`,
      url: `${process.env.ENDPOINT}/settings`
    };
    dispatch(updateMetadata(metadata));
  }, []);

  return (
    <div>
      <div style={styles.card}>
        <PushSettings />
      </div>
      <div style={styles.card}>
        <ProviderLinkSettings />
      </div>
      <DeleteAccountCard />
      <DeleteAccountDialog />
      {smUp && <CreateResourceButton />}
    </div>
  );
};

export default React.memo(Settings);
