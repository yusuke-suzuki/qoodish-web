import React from 'react';
import Drawer from 'material-ui/Drawer';
import Card, { CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import FollowMapButtonContainer from '../containers/FollowMapButtonContainer';
import List, {
  ListItem,
  ListItemText
} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import Button from 'material-ui/Button';
import ExpandLessIcon from 'material-ui-icons/ExpandLess';

const styles = {
  card: {
    minHeight: 136
  },
  listItem: {
    padding: 0
  },
  expandButtonContainer: {
    width: '100%',
    position: 'absolute',
    zIndex: 1201,
    bottom: 116,
    textAlign: 'center'
  },
  expandButton: {
    boxShadow: '0px 1px 5px 0px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 3px 1px -2px rgba(0, 0, 0, 0.12)'
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

class MapBottomSeat extends React.Component {
  render() {
    return (
      <div>
        <div style={styles.expandButtonContainer}>
          <Button
            variant="fab"
            style={styles.expandButton}
            onClick={this.props.handleShowTimelineClick}
            mini={true}
            color="primary"
          >
            <ExpandLessIcon />
          </Button>
        </div>
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
        onClick={this.props.handleShowTimelineClick}
        disableGutters
        style={styles.listItem}
      >
        <Avatar src={map && map.thumbnail_url} />
        <ListItemText
          disableTypography
          primary={
            <Typography variant="subheading" noWrap>
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
