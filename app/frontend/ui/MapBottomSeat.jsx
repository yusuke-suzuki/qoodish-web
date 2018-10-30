import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import ListIcon from '@material-ui/icons/List';

const styles = {
  card: {
    minHeight: 71
  },
  cardContent: {
    padding: 0
  }
};

const Header = (props) => {
  return (
    <ListItem
      onClick={props.handleSummaryOpen}
      button
    >
      <Avatar
        src={props.map && props.map.thumbnail_url}
        alt={props.map && props.map.name}
      />
      <ListItemText
        disableTypography
        primary={
          <Typography variant="subtitle1" noWrap>
            {props.map && props.map.name}
          </Typography>
        }
        secondary={
          <Typography
            component="p"
            noWrap
            color="textSecondary"
          >
            {props.map && props.map.description}
          </Typography>
        }
      />
      <ListItemSecondaryAction
        onClick={props.handleSummaryOpen}
      >
        <IconButton>
          <ListIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
}

const MapBottomSeat = (props) => {
  return (
    <Drawer
      variant="persistent"
      anchor="bottom"
      open={true}
    >
      <Card style={styles.card}>
        <CardContent style={styles.cardContent}>
          <List disablePadding>
             <Header {...props} />
          </List>
        </CardContent>
      </Card>
    </Drawer>
  );
}

export default MapBottomSeat;
