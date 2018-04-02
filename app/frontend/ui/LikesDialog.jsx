import React from 'react';
import Dialog, { DialogContent, DialogTitle } from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import List, { ListItem, ListItemAvatar, ListItemText } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import Slide from 'material-ui/transitions/Slide';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui-icons/Close';
import Toolbar from 'material-ui/Toolbar';
import Divider from 'material-ui/Divider';

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

const styles = {
  toolbar: {
    paddingLeft: 8
  },
  dialogContent: {
    padding: 16
  }
};

class LikesDialog extends React.Component {
  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.props.handleRequestDialogClose}
        fullWidth
        transition={Transition}
      >
        <Toolbar style={styles.toolbar}>
          <IconButton
            color="inherit"
            onClick={this.props.handleRequestDialogClose}
            aria-label="Close"
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="title" color="inherit" style={styles.flex} noWrap>
            Likes
          </Typography>
        </Toolbar>
        <Divider />
        <DialogContent style={styles.dialogContent}>
          <List disablePadding>{this.renderLikes(this.props.likes)}</List>
        </DialogContent>
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
