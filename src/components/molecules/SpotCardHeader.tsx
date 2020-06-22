import React from 'react';

import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

import { Link } from '@yusuke-suzuki/rize-router';

const styles = {
  listItem: {
    paddingTop: 0
  },
  infoButton: {
    padding: 0
  }
};

const SpotCardHeader = props => {
  const { currentSpot } = props;

  return (
    <List disablePadding>
      <ListItem
        button
        disableGutters
        style={styles.listItem}
        component={Link}
        to={{
          pathname: `/spots/${currentSpot.place_id}`,
          state: { modal: true, spot: currentSpot }
        }}
      >
        <ListItemText
          disableTypography
          primary={
            <Typography variant="h6" noWrap>
              {currentSpot.name}
            </Typography>
          }
          secondary={
            <Typography component="p" noWrap color="textSecondary">
              {currentSpot.formatted_address}
            </Typography>
          }
        />
        <ListItemSecondaryAction>
          <IconButton
            component={Link}
            to={{
              pathname: `/spots/${currentSpot.place_id}`,
              state: { modal: true, spot: currentSpot }
            }}
            style={styles.infoButton}
          >
            <InfoOutlinedIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    </List>
  );
};

export default React.memo(SpotCardHeader);
