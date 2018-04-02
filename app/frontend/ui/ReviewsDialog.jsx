import React from 'react';
import Dialog, { DialogContent, DialogTitle } from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import List, { ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import Slide from 'material-ui/transitions/Slide';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui-icons/Close';
import Toolbar from 'material-ui/Toolbar';
import AddIcon from 'material-ui-icons/Add';
import Divider from 'material-ui/Divider';

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

const styles = {
  listItemText: {
    paddingRight: 32
  },
  secondaryAvatar: {
    borderRadius: 0,
    marginRight: 12
  },
  toolbar: {
    paddingLeft: 8
  },
  flex: {
    flex: 1
  },
  dialogContent: {
    padding: 16
  }
};

class ReviewsDialog extends React.Component {
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
            {this.props.currentSpot.name}
          </Typography>
          <Button
            onClick={() => this.props.handleAddReviewButtonClick(this.props.currentSpot)}
            color="primary"
            disabled={this.props.currentMap && !this.props.currentMap.postable}
            variant="raised"
          >
            <AddIcon />
            Add
          </Button>
        </Toolbar>
        <Divider />
        <DialogContent style={styles.dialogContent}>
          <List disablePadding>{this.renderReviews(this.props.reviews)}</List>
        </DialogContent>
      </Dialog>
    );
  }

  renderReviews(reviews) {
    return reviews.map(review => (
      <ListItem
        button
        key={review.id}
        onClick={() => this.props.handleReviewClick(review)}
      >
        <ListItemAvatar>
          <Avatar src={review.author.profile_image_url} />
        </ListItemAvatar>
        <ListItemText
          disableTypography={true}
          primary={
            <Typography variant="subheading" noWrap>
              {review.author.name}
            </Typography>
          }
          secondary={
            <Typography component="p" noWrap color="textSecondary">
              {review.comment}
            </Typography>
          }
          style={styles.listItemText}
        />
        {review.image && (
          <ListItemSecondaryAction>
            <Avatar src={review.image.thumbnail_url} style={styles.secondaryAvatar} />
          </ListItemSecondaryAction>
        )}
      </ListItem>
    ));
  }
}

export default ReviewsDialog;
