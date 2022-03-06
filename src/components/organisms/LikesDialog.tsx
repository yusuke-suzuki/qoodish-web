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
import closeLikesDialog from '../../actions/closeLikesDialog';
import DialogAppBar from '../molecules/DialogAppBar';
import {
  useTheme,
  useMediaQuery,
  makeStyles,
  createStyles
} from '@material-ui/core';

const useStyles = makeStyles(() =>
  createStyles({
    dialogContent: {
      paddingTop: 0
    }
  })
);

const Transition = forwardRef(function Transition(props: SlideProps, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const LikesDialog = () => {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const dispatch = useDispatch();
  const classes = useStyles();

  const mapState = useCallback(
    state => ({
      dialogOpen: state.shared.likesDialogOpen,
      likes: state.shared.likes
    }),
    []
  );
  const { dialogOpen, likes } = useMappedState(mapState);

  const handleClose = useCallback(() => {
    dispatch(closeLikesDialog());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      handleClose();
    };
  }, []);

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      fullWidth
      TransitionComponent={smUp ? Fade : Transition}
    >
      {smUp ? (
        <DialogTitle>{I18n.t('likes')}</DialogTitle>
      ) : (
        <DialogAppBar
          title={I18n.t('likes')}
          handleRequestDialogClose={handleClose}
          color="inherit"
        />
      )}
      <DialogContent className={classes.dialogContent}>
        <List>
          {likes.map(like => (
            <Link key={like.id} href={`/users/${like.voter.id}`} passHref>
              <ListItem button title={like.voter.name}>
                <ListItemAvatar>
                  <>
                    {like.voter.profile_image_url ? (
                      <Avatar
                        src={like.voter.profile_image_url}
                        alt={like.voter.name}
                      />
                    ) : (
                      <Avatar alt={like.voter.name}>
                        {like.voter.name.slice(0, 1)}
                      </Avatar>
                    )}
                  </>
                </ListItemAvatar>
                <ListItemText primary={like.voter.name} />
              </ListItem>
            </Link>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(LikesDialog);
