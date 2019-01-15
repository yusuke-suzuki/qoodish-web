import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import Dialog from '@material-ui/core/Dialog';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Slide from '@material-ui/core/Slide';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Toolbar from '@material-ui/core/Toolbar';
import Divider from '@material-ui/core/Divider';
import { Link } from 'react-router-dom';

import I18n from '../../utils/I18n';
import closeLikesDialog from '../../actions/closeLikesDialog';

const Transition = props => {
  return <Slide direction="up" {...props} />;
};

const styles = {
  toolbar: {
    paddingLeft: 8
  }
};

const LikesDialog = () => {
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      dialogOpen: state.shared.likesDialogOpen,
      likes: state.shared.likes
    }),
    []
  );
  const { dialogOpen, likes } = useMappedState(mapState);

  const handleRequestDialogClose = useCallback(() => {
    dispatch(closeLikesDialog());
  });

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleRequestDialogClose}
      fullWidth
      TransitionComponent={Transition}
    >
      <Toolbar style={styles.toolbar}>
        <IconButton color="inherit" onClick={handleRequestDialogClose}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" color="inherit" noWrap>
          {I18n.t('likes')}
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {likes.map(like => (
          <ListItem
            button
            key={like.id}
            component={Link}
            to={`/users/${like.voter.id}`}
            title={like.voter.name}
          >
            <ListItemAvatar>
              <Avatar
                src={like.voter.profile_image_url}
                alt={like.voter.name}
              />
            </ListItemAvatar>
            <ListItemText primary={like.voter.name} />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
};

export default React.memo(LikesDialog);
