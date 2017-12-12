import React from 'react';
import Dialog, {
  DialogActions,
  DialogTitle,
} from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import List, { ListItem, ListItemAvatar, ListItemText } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';

const styles = {
  profileImage: {
    width: 40,
    height: 40
  }
}

class LikesDialog extends React.Component {
  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onRequestClose={this.props.handleRequestDialogClose}
        fullWidth
      >
      　<DialogTitle>
          Likes
        </DialogTitle>
        <div>
          <List>
            {this.renderLikes(this.props.likes)}
          </List>
        </div>
        <DialogActions>
          <Button onClick={this.props.handleRequestDialogClose}>
            CLOSE
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderLikes(likes) {
    return likes.map((like) => (
      <ListItem
        button
        key={like.id}
        onClick={() => this.props.handleLikeClick(like)}
      >
        <ListItemAvatar>
          <Avatar>
            <img src={like.voter.profile_image_url} style={styles.profileImage} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={like.voter.name} />
      </ListItem>
    ));
  }
}

export default LikesDialog;
