import React, { useCallback, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Avatar from '@material-ui/core/Avatar';
import Slide from '@material-ui/core/Slide';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import I18n from '../../utils/I18n';

import ApiClient from '../../utils/ApiClient';
import closeInviteTargetDialog from '../../actions/closeInviteTargetDialog';
import fetchUsers from '../../actions/fetchUsers';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';
import openToast from '../../actions/openToast';

const styles = {
  appbar: {
    position: 'relative'
  },
  flex: {
    flex: 1
  },
  dialogContentLarge: {
    paddingBottom: 0
  },
  dialogContentSmall: {
    paddingTop: 24
  },
  toolbar: {
    paddingLeft: 8,
    height: 56
  },
  dialogTitle: {
    display: 'flex'
  }
};

const Transition = props => {
  return <Slide direction="up" {...props} />;
};

const InviteTargetDialog = props => {
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(undefined);

  const mapState = useCallback(
    state => ({
      dialogOpen: state.mapDetail.inviteTargetDialogOpen,
      users: state.mapDetail.pickedUsers
    }),
    []
  );
  const { dialogOpen, users } = useMappedState(mapState);

  const dispatch = useDispatch();
  const large = useMediaQuery('(min-width: 600px)');

  const onClose = useCallback(() => {
    dispatch(closeInviteTargetDialog());
  });

  const handleInputChange = useCallback(async input => {
    if (loading || !input) {
      return;
    }
    setLoading(true);
    const client = new ApiClient();
    let response = await client.fetchUsers(input);
    let users = await response.json();
    setLoading(false);
    if (response.ok) {
      dispatch(fetchUsers(users));
    }
  });

  const handleUserClick = useCallback(user => {
    setSelectedUserId(user.id);
  });

  const handleSendButtonClick = useCallback(async () => {
    dispatch(requestStart());
    const client = new ApiClient();
    const response = await client.sendInvite(props.mapId, selectedUserId);
    dispatch(requestFinish());
    if (response.ok) {
      dispatch(closeInviteTargetDialog());
      dispatch(openToast(I18n.t('send invitation success')));
    } else {
      dispatch(openToast('Failed to send invites'));
    }
  });

  return (
    <Dialog
      open={dialogOpen}
      onClose={onClose}
      fullWidth
      fullScreen={!large}
      TransitionComponent={Transition}
    >
      {large ? (
        <DialogTitle>{I18n.t('select invite target')}</DialogTitle>
      ) : (
        <AppBar style={styles.appbar} color="primary">
          <Toolbar style={styles.toolbar}>
            <IconButton color="inherit" onClick={onClose}>
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" style={styles.flex}>
              {I18n.t('select invite target')}
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                handleSendButtonClick(selectedUserId);
              }}
              color="secondary"
              disabled={!selectedUserId}
            >
              {I18n.t('invite')}
            </Button>
          </Toolbar>
        </AppBar>
      )}
      <DialogContent
        style={large ? styles.dialogContentLarge : styles.dialogContentSmall}
      >
        <TextField
          label={I18n.t('search users')}
          onChange={e => handleInputChange(e.target.value)}
          fullWidth
          autoFocus
          margin="normal"
        />
        <List>
          {users.map(user => (
            <ListItem
              button
              key={user.id}
              onClick={() => handleUserClick(user)}
            >
              <ListItemAvatar>
                <Avatar src={user.image_url} />
              </ListItemAvatar>
              <ListItemText primary={user.name} />
              <ListItemSecondaryAction>
                <Checkbox
                  checked={selectedUserId === user.id}
                  onClick={() => handleUserClick(user)}
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      {large && (
        <DialogActions>
          <Button onClick={onClose}>{I18n.t('cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleSendButtonClick}
            color="primary"
            disabled={!selectedUserId}
          >
            {I18n.t('invite')}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default React.memo(InviteTargetDialog);
