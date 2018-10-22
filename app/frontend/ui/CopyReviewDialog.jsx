import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import I18n from '../containers/I18n';

class CopyReviewDialog extends React.PureComponent {
  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onEnter={this.props.fetchPostableMaps}
        onClose={this.props.handleRequestClose}
        fullWidth
      >
        <DialogTitle>{I18n.t('select map to copy this report to')}</DialogTitle>
        <DialogContent>{this.renderPostableMaps()}</DialogContent>
        <DialogActions>
          <Button onClick={this.props.handleRequestClose}>{I18n.t('cancel')}</Button>
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
