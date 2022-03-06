import React from 'react';

import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import SpotLink from './SpotLink';
import { createStyles, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() =>
  createStyles({
    listItem: {
      paddingTop: 0
    },
    infoButton: {
      padding: 0
    }
  })
);

const SpotCardHeader = props => {
  const { currentSpot } = props;
  const classes = useStyles();

  return (
    <List disablePadding>
      <SpotLink spot={currentSpot}>
        <ListItem button disableGutters className={classes.listItem}>
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
            <SpotLink spot={currentSpot}>
              <IconButton className={classes.infoButton}>
                <InfoOutlinedIcon />
              </IconButton>
            </SpotLink>
          </ListItemSecondaryAction>
        </ListItem>
      </SpotLink>
    </List>
  );
};

export default React.memo(SpotCardHeader);
