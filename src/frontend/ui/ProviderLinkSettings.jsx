import React from 'react';
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
import I18n from '../containers/I18n';

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

const LinkedProvidersList = props => {
  let reachedMinimum = props.linkedProviders.length === 1;

  return providers.map(provider => {
    let linked = props.linkedProviders.includes(provider.id);

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
                ? props.handleUnlinkProviderButtonClick(provider.id)
                : props.handleLinkProviderButtonClick(provider.id);
            }}
            disabled={
              props.currentUser.isAnonymous || (linked && reachedMinimum)
            }
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

const ProviderLinkSettings = props => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          {I18n.t('link providers')}
        </Typography>
        <Typography component="p" gutterBottom>
          {I18n.t('link providers detail')}
        </Typography>
        <List>
          <LinkedProvidersList {...props} />
        </List>
      </CardContent>
    </Card>
  );
};

export default ProviderLinkSettings;
