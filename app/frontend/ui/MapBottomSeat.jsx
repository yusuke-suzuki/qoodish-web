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

class MapBottomSeat extends React.PureComponent {
  render() {
    return (
      <Drawer
        variant="persistent"
        anchor="bottom"
        open={true}
      >
        {this.renderSummaryCard()}
      </Drawer>
    );
  }

  renderSummaryCard() {
    return (
      <Card style={styles.card}>
        <CardContent style={styles.cardContent}>
          <List disablePadding>
            {this.renderHeader(this.props.currentMap)}
          </List>
        </CardContent>
      </Card>
    );
  }

  renderHeader(map) {
    return (
      <ListItem
        onClick={this.props.handleSummaryOpen}
        button
      >
        <Avatar
          src={map && map.thumbnail_url}
          alt={map && map.name}
        />
        <ListItemText
          disableTypography
          primary={
            <Typography variant="subtitle1" noWrap>
              {map && map.name}
            </Typography>
          }
          secondary={
            <Typography
              component="p"
              noWrap
              color="textSecondary"
            >
              {map && map.description}
            </Typography>
          }
        />
        <ListItemSecondaryAction
          onClick={this.props.handleSummaryOpen}
        >
          <IconButton>
            <ListIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  }
}

export default MapBottomSeat;
