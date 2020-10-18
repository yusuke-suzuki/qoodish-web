import React, { forwardRef, useCallback, useEffect } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Slide, { SlideProps } from '@material-ui/core/Slide';
import Fade from '@material-ui/core/Fade';
import Link from 'next/link';

import I18n from '../../utils/I18n';
import closeFollowersDialog from '../../actions/closeFollowersDialog';
import DialogAppBar from '../molecules/DialogAppBar';
import { useMediaQuery, useTheme } from '@material-ui/core';

const Transition = forwardRef(function Transition(props: SlideProps, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FollowersDialog = () => {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
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
  }, [dispatch]);

  useEffect(() => {
    return () => {
      handleRequestDialogClose();
    };
  }, []);

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleRequestDialogClose}
      fullWidth
      TransitionComponent={mdUp ? Fade : Transition}
    >
      {mdUp ? (
        <DialogTitle>{I18n.t('followers')}</DialogTitle>
      ) : (
        <DialogAppBar
          title={I18n.t('followers')}
          handleRequestDialogClose={handleRequestDialogClose}
          color="inherit"
        />
      )}
      <DialogContent>
        <List>
          {followers.map(follower => (
            <Link key={follower.id} href={`/users/${follower.id}`} passHref>
              <ListItem button title={follower.name}>
                <ListItemAvatar>
                  <>
                    {follower.profile_image_url ? (
                      <Avatar
                        src={follower.profile_image_url}
                        alt={follower.name}
                      />
                    ) : (
                      <Avatar alt={follower.name}>
                        {follower.name.slice(0, 1)}
                      </Avatar>
                    )}
                  </>
                </ListItemAvatar>
                <ListItemText primary={follower.name} />
              </ListItem>
            </Link>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(FollowersDialog);
