import React from 'react';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle,
} from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import MapIcon from 'material-ui-icons/Map';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';

class CopyReviewDialog extends React.Component {
  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.props.handleRequestClose}
        fullWidth
      >
        <DialogTitle>
          Select map to copy this report to
        </DialogTitle>
        <DialogContent>
          {this.renderPostableMaps()}
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.handleRequestClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderPostableMaps() {
    return this.props.postableMaps.map((map) => (
      <ListItem
        button
        key={map.id}
        onClick={() => this.props.handleMapSelected(this.props.currentReview, map)}
      >
        <Avatar>
          <MapIcon />
        </Avatar>
        <ListItemText primary={map.name} />
      </ListItem>
    ));
  }
}

export default CopyReviewDialog;
