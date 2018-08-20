import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import { Link } from 'react-router-dom';
import I18n from '../containers/I18n';

const styles = {
  ownerMark: {
    right: 12
  }
}

export default class MapFollowersList extends React.PureComponent {
  componentWillMount() {
    this.props.fetchFollowers(this.props.mapId);
  }

  render() {
    return (
      <List disablePadding>
        {this.renderFollowers(this.props.followers)}
      </List>
    );
  }

  renderFollowers(followers) {
    return followers.map(follower => (
      <ListItem
        button
        key={follower.id}
        component={Link}
        to={`/users/${follower.id}`}
      >
        <Avatar
          src={follower.profile_image_url}
          alt={follower.name}
        />
        <ListItemText primary={follower.name} />
        {follower.owner && this.renderOwnerMark()}
      </ListItem>
    ));
  }

  renderOwnerMark() {
    return (
      <ListItemSecondaryAction style={styles.ownerMark}>
        <Chip label={I18n.t('owner')} />
      </ListItemSecondaryAction>
    );
  }
}
