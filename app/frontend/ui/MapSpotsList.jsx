import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';

export default class MapSpotsList extends React.PureComponent {
  render() {
    return (
      <List disablePadding>
        {this.renderSpots(this.props.spots)}
      </List>
    );
  }

  renderSpots(spots) {
    return spots.map(spot => (
      <ListItem
        button
        key={spot.place_id}
        onClick={() => this.props.handleSpotClick(spot)}
      >
        <Avatar src={spot.image_url} />
        <ListItemText
          disableTypography={true}
          primary={
            <Typography variant="subheading" noWrap>
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
  }
}
