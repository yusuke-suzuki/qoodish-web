import React from 'react';
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

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class InviteTargetDialog extends React.Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleUserClick = this.handleUserClick.bind(this);
    this.state = {
      selectedUserId: undefined
    };
  }

  handleInputChange(e) {
    let input = e.target.value;
    if (this.props.loadingUsers || !input) {
      return;
    }
    this.props.handleInputChange(input);
  }

  handleUserClick(user) {
    this.setState({
      selectedUserId: user.id
    });
  }

  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.props.onClose}
        fullWidth
        fullScreen={!this.props.large}
        TransitionComponent={Transition}
      >
        {this.props.large ? this.renderDialogTitle() : this.renderAppBar()}
        <DialogContent
          style={
            this.props.large
              ? styles.dialogContentLarge
              : styles.dialogContentSmall
          }
        >
          <TextField
            label="Search users..."
            onChange={this.handleInputChange}
            fullWidth
            autoFocus
          />
          <List>{this.renderUsers()}</List>
        </DialogContent>
        {this.props.large && this.renderAction()}
      </Dialog>
    );
  }

  renderDialogTitle() {
    return (
      <DialogTitle>
        Select Invite Target
      </DialogTitle>
    );
  }

  renderAppBar() {
    return (
      <AppBar style={styles.appbar} color="primary">
        <Toolbar style={styles.toolbar}>
          <IconButton
            color="inherit"
            onClick={this.props.onClose}
            aria-label="Close"
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="title" color="inherit" style={styles.flex}>
            Select Invite Target
          </Typography>
          <Button
            variant="raised"
            onClick={() => {
              this.props.handleSendButtonClick(this.state.selectedUserId);
            }}
            color="secondary"
            disabled={!this.state.selectedUserId}
          >
            SEND
          </Button>
        </Toolbar>
      </AppBar>
    );
  }

  renderAction() {
    return (
      <DialogActions>
        <Button onClick={this.props.onClose}>Cancel</Button>
        <Button
          variant="raised"
          onClick={() => {
            this.props.handleSendButtonClick(this.state.selectedUserId);
          }}
          color="primary"
          disabled={!this.state.selectedUserId}
        >
          SEND
        </Button>
      </DialogActions>
    );
  }

  renderUsers() {
    return this.props.users.map(user => (
      <ListItem
        button
        key={user.id}
        onClick={() => this.handleUserClick(user)}
      >
        <ListItemAvatar>
          <Avatar src={user.image_url} />
        </ListItemAvatar>
        <ListItemText primary={user.name} />
        <ListItemSecondaryAction>
          <Checkbox
            checked={this.state.selectedUserId === user.id}
            onClick={() => this.handleUserClick(user)}
          />
        </ListItemSecondaryAction>
      </ListItem>
    ));
  }
}

export default InviteTargetDialog;
