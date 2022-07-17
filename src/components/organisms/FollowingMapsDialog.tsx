import React, { forwardRef, useCallback, useEffect } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Slide, { SlideProps } from '@material-ui/core/Slide';
import Fade from '@material-ui/core/Fade';

import Link from 'next/link';
import FollowMapButton from '../molecules/FollowMapButton';
import closeFollowingMapsDialog from '../../actions/closeFollowingMapsDialog';
import DialogAppBar from '../molecules/DialogAppBar';
import {
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles(() =>
  createStyles({
    dialogContent: {
      padding: 0
    },
    listItem: {
      paddingRight: 140
    }
  })
);

const Transition = forwardRef(function Transition(props: SlideProps, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FollowingMapsDialog = () => {
  const theme = useTheme();
  const classes = useStyles();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const mapState = useCallback(
    state => ({
      open: state.profile.followingMapsDialogOpen,
      maps: state.profile.followingMaps
    }),
    []
  );
  const { open, maps } = useMappedState(mapState);
  const dispatch = useDispatch();
  const { I18n } = useLocale();

  const onClose = useCallback(() => {
    dispatch(closeFollowingMapsDialog());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      onClose();
    };
  }, []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={!smUp}
      TransitionComponent={smUp ? Fade : Transition}
    >
      {smUp ? (
        <DialogTitle>{I18n.t('following')}</DialogTitle>
      ) : (
        <DialogAppBar
          title={I18n.t('following')}
          handleRequestDialogClose={onClose}
          color="inherit"
        />
      )}
      <DialogContent className={classes.dialogContent}>
        <List>
          {maps.map(map => (
            <Link key={map.id} href={`/maps/${map.id}`} passHref>
              <ListItem button onClick={onClose} className={classes.listItem}>
                <ListItemAvatar>
                  <Avatar
                    alt={map.name}
                    src={map.thumbnail_url}
                    imgProps={{
                      loading: 'lazy'
                    }}
                  />
                </ListItemAvatar>
                <ListItemText
                  disableTypography={true}
                  primary={
                    <Typography variant="subtitle1" noWrap>
                      {map.name}
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <FollowMapButton currentMap={map} />
                </ListItemSecondaryAction>
              </ListItem>
            </Link>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(FollowingMapsDialog);
