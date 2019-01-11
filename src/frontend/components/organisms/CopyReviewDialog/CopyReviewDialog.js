import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import I18n from '../../../utils/I18n';

const PostableMaps = props => {
  return props.postableMaps.map(map => (
    <ListItem
      button
      key={map.id}
      onClick={() => props.handleMapSelected(props.currentReview, map)}
    >
      <Avatar src={map.thumbnail_url} />
      <ListItemText primary={map.name} />
    </ListItem>
  ));
};

const CopyReviewDialog = props => {
  return (
    <Dialog
      open={props.dialogOpen}
      onEnter={props.fetchPostableMaps}
      onClose={props.handleRequestClose}
      fullWidth
    >
      <DialogTitle>{I18n.t('select map to copy this report to')}</DialogTitle>
      <DialogContent>
        <PostableMaps {...props} />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleRequestClose}>{I18n.t('cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CopyReviewDialog;
