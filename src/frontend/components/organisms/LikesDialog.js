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
import closeLikesDialog from '../../actions/closeLikesDialog';
import DialogAppBar from '../molecules/DialogAppBar';

const styles = {
  dialogContent: {
    padding: 0
  }
};

const Transition = props => {
  return <Slide direction="up" {...props} />;
};

const LikesDialog = () => {
  const large = useMediaQuery('(min-width: 600px)');
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
      TransitionComponent={large ? Fade : Transition}
    >
      {large ? (
        <DialogTitle>{I18n.t('likes')}</DialogTitle>
      ) : (
        <DialogAppBar
          title={I18n.t('likes')}
          handleRequestDialogClose={handleRequestDialogClose}
          color="inherit"
        />
      )}
      <DialogContent style={styles.dialogContent}>
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
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(LikesDialog);
