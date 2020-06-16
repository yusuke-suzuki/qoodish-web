import React, { useCallback, useState } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

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
import Fade from '@material-ui/core/Fade';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import I18n from '../../utils/I18n';

import closeInviteTargetDialog from '../../actions/closeInviteTargetDialog';
import fetchUsers from '../../actions/fetchUsers';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';
import openToast from '../../actions/openToast';

import {
  UsersApi,
  InvitesApi,
  NewInvite
} from '@yusuke-suzuki/qoodish-api-js-client';
import DialogAppBar from '../molecules/DialogAppBar';

const styles = {
  dialogContentLarge: {
    paddingBottom: 0
  },
  dialogContentSmall: {
    paddingTop: 24
  },
  dialogTitle: {
    display: 'flex'
  }
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const InviteTargetDialog = props => {
  const { mapId } = props;
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
  }, [dispatch]);

  const handleInputChange = useCallback(
    async input => {
      if (loading || !input) {
        return;
      }
      setLoading(true);

      const apiInstance = new UsersApi();
      const opts = {
        input: input
      };
      apiInstance.usersGet(opts, (error, data, response) => {
        setLoading(false);
        if (response.ok) {
          dispatch(fetchUsers(response.body));
        }
      });
    },
    [dispatch, loading]
  );

  const handleUserClick = useCallback(user => {
    setSelectedUserId(user.id);
  }, []);

  const handleSendButtonClick = useCallback(async () => {
    dispatch(requestStart());

    const apiInstance = new InvitesApi();
    const newInvite = NewInvite.constructFromObject({
      user_id: selectedUserId
    });

    apiInstance.mapsMapIdInvitesPost(
      mapId,
      newInvite,
      (error, data, response) => {
        dispatch(requestFinish());
        if (response.ok) {
          dispatch(closeInviteTargetDialog());
          dispatch(openToast(I18n.t('send invitation success')));
        } else {
          dispatch(openToast('Failed to send invites'));
        }
      }
    );
  }, [dispatch, mapId, selectedUserId]);

  return (
    <Dialog
      open={dialogOpen}
      onClose={onClose}
      fullWidth
      fullScreen={!large}
      TransitionComponent={large ? Fade : Transition}
    >
      {large ? (
        <DialogTitle>{I18n.t('select invite target')}</DialogTitle>
      ) : (
        <DialogAppBar
          title={I18n.t('select invite target')}
          handleRequestDialogClose={onClose}
          action={
            <Button
              variant="contained"
              onClick={handleSendButtonClick}
              color="secondary"
              disabled={!selectedUserId}
            >
              {I18n.t('invite')}
            </Button>
          }
        />
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
