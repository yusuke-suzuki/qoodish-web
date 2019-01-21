import React, { useCallback } from 'react';
import { useMappedState } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';

import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import Link from '../molecules/Link';
import I18n from '../../utils/I18n';

const styles = {
  ownerMark: {
    right: 12
  },
  subheader: {
    height: 36
  }
};

const MapFollowersList = () => {
  const large = useMediaQuery('(min-width: 600px)');
  const followers = useMappedState(
    useCallback(state => state.mapSummary.followers, [])
  );

  return (
    <List
      subheader={
        large && (
          <ListSubheader style={styles.subheader}>
            {I18n.t('followers')}
          </ListSubheader>
        )
      }
    >
      {followers.map(follower => (
        <ListItem
          button
          key={follower.id}
          component={Link}
          to={`/users/${follower.id}`}
        >
          <Avatar src={follower.profile_image_url} alt={follower.name} />
          <ListItemText primary={follower.name} />
          {follower.owner && (
            <ListItemSecondaryAction style={styles.ownerMark}>
              <Chip label={I18n.t('owner')} />
            </ListItemSecondaryAction>
          )}
        </ListItem>
      ))}
    </List>
  );
};

export default React.memo(MapFollowersList);
