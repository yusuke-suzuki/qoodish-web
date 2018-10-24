import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import FollowMapButtonContainer from '../containers/FollowMapButtonContainer';

const styles = {
  card: {
    minHeight: 136
  },
  listItem: {
    padding: 0
  },
  cardContent: {
    paddingTop: 24,
    paddingBottom: 16
  },
  cardActions: {
    display: 'flex',
    marginTop: 16
  }
};

class MapBottomSeat extends React.PureComponent {
  render() {
    return (
      <div>
        {this.renderDrawer()}
      </div>
    );
  }

  renderDrawer() {
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
          <List disablePadding>{this.renderHeader(this.props.currentMap)}</List>
          <div style={styles.cardActions}>
            <FollowMapButtonContainer currentMap={this.props.currentMap} />
          </div>
        </CardContent>
      </Card>
    );
  }

  renderHeader(map) {
    return (
      <ListItem
        disableGutters
        style={styles.listItem}
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
      </ListItem>
    );
  }
}

export default MapBottomSeat;
