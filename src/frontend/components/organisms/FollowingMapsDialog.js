import React, { useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import Dialog from '@material-ui/core/Dialog';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import I18n from '../../utils/I18n';
import Link from '../molecules/Link';
import Slide from '@material-ui/core/Slide';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Toolbar from '@material-ui/core/Toolbar';
import Divider from '@material-ui/core/Divider';
import FollowMapButton from '../molecules/FollowMapButton';

import closeFollowingMapsDialog from '../../actions/closeFollowingMapsDialog';

const Transition = props => {
  return <Slide direction="up" {...props} />;
};

const styles = {
  toolbar: {
    paddingLeft: 8
  },
  listItem: {
    paddingRight: 100
  },
  listItemSecondaryAction: {
    paddingRight: 16
  }
};

const FollowingMapsDialog = () => {
  const large = useMediaQuery('(min-width: 600px)');
  const mapState = useCallback(
    state => ({
      open: state.profile.followingMapsDialogOpen,
      maps: state.profile.followingMaps
    }),
    []
  );
  const { open, maps } = useMappedState(mapState);
  const dispatch = useDispatch();

  const onClose = useCallback(() => {
    dispatch(closeFollowingMapsDialog());
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={!large}
      TransitionComponent={Transition}
    >
      <Toolbar style={styles.toolbar}>
        <IconButton color="inherit" onClick={onClose}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" color="inherit" noWrap>
          {I18n.t('following')}
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {maps.map(map => (
          <ListItem
            button
            component={Link}
            to={`/maps/${map.id}`}
            key={map.id}
            onClick={onClose}
            style={styles.listItem}
          >
            <ListItemAvatar>
              <Avatar alt={map.name} src={map.thumbnail_url} />
            </ListItemAvatar>
            <ListItemText
              primary={map.name}
              primaryTypographyProps={{ noWrap: true }}
            />
            <ListItemSecondaryAction style={styles.listItemSecondaryAction}>
              <FollowMapButton currentMap={map} />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
};

export default React.memo(FollowingMapsDialog);
