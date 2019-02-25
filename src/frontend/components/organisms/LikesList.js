import React, { useEffect, useCallback, useState } from 'react';
import { useMappedState } from 'redux-react-hook';

import Link from '../molecules/Link';

import moment from 'moment';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Avatar from '@material-ui/core/Avatar';
import ButtonBase from '@material-ui/core/ButtonBase';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

import NoContents from '../molecules/NoContents';

import I18n from '../../utils/I18n';
import { LikesApi } from 'qoodish_api';
import initializeApiClient from '../../utils/initializeApiClient';

const styles = {
  listItemText: {
    paddingRight: 32
  },
  secondaryAvatar: {
    borderRadius: 0,
    marginRight: 12,
    cursor: 'pointer'
  }
};

const PrimaryText = props => {
  switch (props.like.votable.type) {
    case 'review':
      return (
        <React.Fragment>
          <b>{props.like.voter.name}</b>
          {` ${I18n.t('liked report of').replace(
            'owner',
            props.like.votable.owner.name
          )}`}
          <b>{props.like.votable.name}</b>
        </React.Fragment>
      );
    case 'map':
      return (
        <React.Fragment>
          <b>{props.like.voter.name}</b>
          {` ${I18n.t('liked map of').replace(
            'owner',
            props.like.votable.owner.name
          )}`}
          <b>{props.like.votable.name}</b>
        </React.Fragment>
      );
    default:
      return '';
  }
};

const fromNow = like => {
  return moment(like.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ')
    .locale(window.currentLocale)
    .fromNow();
};

const LikesList = props => {
  const [likes, setLikes] = useState([]);

  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser,
      location: state.shared.currentLocation
    }),
    []
  );

  const { currentUser, location } = useMappedState(mapState);

  const initUserLikes = useCallback(async () => {
    let userId =
      location && location.pathname === '/profile'
        ? currentUser.uid
        : props.params.primaryId;

    await initializeApiClient();
    const apiInstance = new LikesApi();

    apiInstance.usersUserIdLikesGet(userId, (error, data, response) => {
      if (response.ok) {
        setLikes(response.body);
      }
    });
  });

  useEffect(() => {
    initUserLikes();
  }, []);

  if (likes.length < 1) {
    return (
      <NoContents
        contentType="like"
        action="discover-reviews"
        message={I18n.t('likes will see here')}
      />
    );
  }
  return (
    <Paper>
      <List>
        {likes.map(like => (
          <ListItem
            key={like.id}
            button
            component={Link}
            to={like.click_action}
          >
            <Avatar src={like.voter.profile_image_url} alt={like.voter.name} />
            <ListItemText
              style={styles.listItemText}
              primary={
                <Typography variant="subtitle1">
                  <PrimaryText like={like} />
                </Typography>
              }
              secondary={
                <Typography variant="subtitle1" color="textSecondary">
                  {fromNow(like)}
                </Typography>
              }
              disableTypography
            />
            {like.votable.thumbnail_url && (
              <ListItemSecondaryAction>
                <ButtonBase component={Link} to={like.click_action}>
                  <Avatar
                    src={like.votable.thumbnail_url}
                    style={styles.secondaryAvatar}
                  />
                </ButtonBase>
              </ListItemSecondaryAction>
            )}
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default React.memo(LikesList);
