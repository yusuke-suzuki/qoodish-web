import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import EditIcon from '@material-ui/icons/Edit';
import MapIcon from '@material-ui/icons/Map';
import Dialog from '@material-ui/core/Dialog';
import I18n from '../containers/I18n';

const ActionsList = props => {
  return (
    <List>
      <ListItem
        button
        key="review"
        onClick={() => props.handleCreateReviewButtonClick(props.currentSpot)}
        data-test="create-review-button"
      >
        <ListItemIcon>
          <EditIcon />
        </ListItemIcon>
        <ListItemText primary={I18n.t("create new report")} />
      </ListItem>
      <ListItem
        button
        key="map"
        onClick={props.handleCreateMapButtonClick}
        data-test="create-map-button"
      >
        <ListItemIcon>
          <MapIcon />
        </ListItemIcon>
        <ListItemText primary={I18n.t("create new map")} />
      </ListItem>
    </List>
  );
};

const ActionsDrawer = props => {
  return (
    <Drawer
      anchor="bottom"
      open={props.open}
      onClose={props.handleCloseDrawer}
    >
      <ActionsList {...props} />
    </Drawer>
  );
};

const ActionsDialog = props => {
  return (
    <Dialog
      open={props.open}
      onClose={props.handleCloseDrawer}
      fullWidth
    >
      <ActionsList {...props} />
    </Dialog>
  );
};

const CreateActions = props => {
  return props.large ? <ActionsDialog {...props} /> : <ActionsDrawer {...props} />
};

export default CreateActions;
