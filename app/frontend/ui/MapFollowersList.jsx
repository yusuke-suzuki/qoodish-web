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
}

export default class MapFollowersList extends React.PureComponent {
  componentWillMount() {
    this.props.fetchFollowers(this.props.mapId);
  }

  render() {
    return (
      <List
        subheader={
          <ListSubheader style={styles.subheader}>{I18n.t('followers')}</ListSubheader>
        }
      >
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
