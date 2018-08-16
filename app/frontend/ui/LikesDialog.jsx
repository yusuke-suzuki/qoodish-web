import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Slide from '@material-ui/core/Slide';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Toolbar from '@material-ui/core/Toolbar';
import Divider from '@material-ui/core/Divider';
import I18n from '../containers/I18n';
import { Link } from 'react-router-dom';

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
        TransitionComponent={Transition}
      >
        <Toolbar style={styles.toolbar}>
          <IconButton
            color="inherit"
            onClick={this.props.handleRequestDialogClose}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="title" color="inherit" style={styles.flex} noWrap>
            {I18n.t('likes')}
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
        component={Link}
        to={`/users/${like.voter.id}`}
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
