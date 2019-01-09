import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import { Link } from 'react-router-dom';
import I18n from '../containers/I18n';
import ListSubheader from '@material-ui/core/ListSubheader';

const styles = {
  ownerMark: {
    right: 12
  },
  subheader: {
    height: 36
  }
};

const OwnerMark = () => {
  return (
    <ListItemSecondaryAction style={styles.ownerMark}>
      <Chip label={I18n.t('owner')} />
    </ListItemSecondaryAction>
  );
};

const Followers = props => {
  return props.followers.map(follower => (
    <ListItem
      button
      key={follower.id}
      component={Link}
      to={`/users/${follower.id}`}
    >
      <Avatar src={follower.profile_image_url} alt={follower.name} />
      <ListItemText primary={follower.name} />
      {follower.owner && <OwnerMark />}
    </ListItem>
  ));
};

const MapFollowersList = props => {
  return (
    <List
      subheader={
        props.large && (
          <ListSubheader style={styles.subheader}>
            {I18n.t('followers')}
          </ListSubheader>
        )
      }
    >
      <Followers {...props} />
    </List>
  );
};

export default MapFollowersList;
