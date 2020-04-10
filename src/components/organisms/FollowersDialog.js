import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Slide from '@material-ui/core/Slide';
import Fade from '@material-ui/core/Fade';
import { Link } from '@yusuke-suzuki/rize-router';

import I18n from '../../utils/I18n';
import closeFollowersDialog from '../../actions/closeFollowersDialog';
import DialogAppBar from '../molecules/DialogAppBar';

const styles = {
  dialogContent: {
    padding: 0
  }
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FollowersDialog = () => {
  const large = useMediaQuery('(min-width: 600px)');
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      dialogOpen: state.shared.followersDialogOpen,
      followers: state.mapSummary.followers
    }),
    []
  );
  const { dialogOpen, followers } = useMappedState(mapState);

  const handleRequestDialogClose = useCallback(() => {
    dispatch(closeFollowersDialog());
  });

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleRequestDialogClose}
      fullWidth
      TransitionComponent={large ? Fade : Transition}
    >
      {large ? (
        <DialogTitle>{I18n.t('followers')}</DialogTitle>
      ) : (
        <DialogAppBar
          title={I18n.t('followers')}
          handleRequestDialogClose={handleRequestDialogClose}
          color="inherit"
        />
      )}
      <DialogContent style={styles.dialogContent}>
        <List>
          {followers.map(follower => (
            <ListItem
              button
              key={follower.id}
              component={Link}
              to={`/users/${follower.id}`}
              title={follower.name}
            >
              <ListItemAvatar>
                <Avatar src={follower.profile_image_url} alt={follower.name} />
              </ListItemAvatar>
              <ListItemText primary={follower.name} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(FollowersDialog);
