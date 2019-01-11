import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import ListSubheader from '@material-ui/core/ListSubheader';
import I18n from '../../../utils/I18n';

const styles = {
  subheader: {
    height: 36
  }
};

const Spots = props => {
  return props.spots.map(spot => (
    <ListItem
      button
      key={spot.place_id}
      onClick={() => props.handleSpotClick(spot)}
    >
      <Avatar src={spot.image_url} alt={spot.name} />
      <ListItemText
        disableTypography={true}
        primary={
          <Typography variant="subtitle1" noWrap>
            {spot.name}
          </Typography>
        }
        secondary={
          <Typography component="p" noWrap color="textSecondary">
            {spot.formatted_address}
          </Typography>
        }
      />
    </ListItem>
  ));
};

const MapSpotsList = props => {
  return (
    <List
      subheader={
        props.large && (
          <ListSubheader style={styles.subheader}>
            {I18n.t('spots')}
          </ListSubheader>
        )
      }
    >
      <Spots {...props} />
    </List>
  );
};

export default MapSpotsList;
