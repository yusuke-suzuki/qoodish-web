import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';

class CopyReviewDialog extends React.Component {
  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.props.handleRequestClose}
        fullWidth
      >
        <DialogTitle>Select map to copy this report to</DialogTitle>
        <DialogContent>{this.renderPostableMaps()}</DialogContent>
        <DialogActions>
          <Button onClick={this.props.handleRequestClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderPostableMaps() {
    return this.props.postableMaps.map(map => (
      <ListItem
        button
        key={map.id}
        onClick={() =>
          this.props.handleMapSelected(this.props.currentReview, map)
        }
      >
        <Avatar src={map.thumbnail_url} />
        <ListItemText primary={map.name} />
      </ListItem>
    ));
  }
}

export default CopyReviewDialog;
