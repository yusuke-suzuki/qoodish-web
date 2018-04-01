import React from 'react';
import Dialog, { DialogContent, DialogTitle, DialogActions } from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import List, { ListItem, ListItemAvatar, ListItemText } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import Slide from 'material-ui/transitions/Slide';

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class LikesDialog extends React.Component {
  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.props.handleRequestDialogClose}
        fullWidth
        transition={Transition}
      >
        <DialogTitle>Likes</DialogTitle>
        <DialogContent>
          <List disablePadding>{this.renderLikes(this.props.likes)}</List>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.handleRequestDialogClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderLikes(likes) {
    return likes.map(like => (
      <ListItem
        button
        key={like.id}
        onClick={() => this.props.handleLikeClick(like)}
      >
        <ListItemAvatar>
          <Avatar src={like.voter.profile_image_url} />
        </ListItemAvatar>
        <ListItemText primary={like.voter.name} />
      </ListItem>
    ));
  }
}

export default LikesDialog;
