import React from 'react';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';
import CommentMenuContainer from '../containers/CommentMenuContainer';
import I18n from '../containers/I18n';
import { Link } from 'react-router-dom';

import moment from 'moment';

const styles = {
  primaryTextContainer: {
    display: 'flex'
  },
  fromNow: {
    marginLeft: 'auto'
  },
  commentBody: {
    wordBreak: 'break-all'
  }
};

const fromNow = (comment) => {
  return moment(comment.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ')
    .locale(window.currentLocale)
    .fromNow();
};

const Comments = props => {
  return props.review.comments.map(comment => (
    <ListItem key={comment.id}>
      <ButtonBase
        component={Link}
        to={`/users/${comment.author.id}`}
        title={comment.author.name}
      >
        <Avatar
          src={comment.author.profile_image_url}
          alt={comment.author.name}
        />
      </ButtonBase>
      <ListItemText
        primary={
          <div style={styles.primaryTextContainer}>
            <Typography
              color="textPrimary"
              noWrap
            >
              {comment.author.name}
            </Typography>
            <Typography
              color="textSecondary"
              variant="body2"
              style={styles.fromNow}
            >
              {fromNow(comment)}
            </Typography>
          </div>
        }
        secondary={
          <Typography color="textPrimary" style={styles.commentBody}>
            {comment.body}
          </Typography>
        }
      />
      <ListItemSecondaryAction>
        <CommentMenuContainer comment={comment} />
      </ListItemSecondaryAction>
    </ListItem>
  ));
};

const ReviewComments = props => {
  return (
    <List
      disablePadding
      subheader={
        <ListSubheader>{`${props.review.comments.length} ${I18n.t('comment count')}`}</ListSubheader>
      }
    >
      <Comments {...props} />
    </List>
  );
};

export default ReviewComments;
