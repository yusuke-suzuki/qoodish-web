import React from 'react';
import Dialog, { DialogContent, DialogTitle, DialogActions } from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import List, { ListItem, ListItemAvatar, ListItemText } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import Slide from 'material-ui/transitions/Slide';
import Typography from 'material-ui/Typography';

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class ReviewsDialog extends React.Component {
  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.props.handleRequestDialogClose}
        fullWidth
        transition={Transition}
      >
        <DialogTitle>Reports</DialogTitle>
        <DialogContent>
          <List disablePadding>{this.renderReviews(this.props.reviews)}</List>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.handleRequestDialogClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderReviews(reviews) {
    return reviews.map(review => (
      <ListItem
        button
        key={review.id}
        onClick={() => this.props.handleReviewClick(review, this.props.large)}
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
        />
      </ListItem>
    ));
  }
}

export default ReviewsDialog;
