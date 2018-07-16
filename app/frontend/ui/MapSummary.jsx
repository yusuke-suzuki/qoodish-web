import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import PlaceIcon from '@material-ui/icons/Place';
import TimelineIcon from '@material-ui/icons/Timeline';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Chip from '@material-ui/core/Chip';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import LockIcon from '@material-ui/icons/Lock';
import GroupIcon from '@material-ui/icons/Group';
import Tooltip from '@material-ui/core/Tooltip';

import moment from 'moment';
import MapToolbarContainer from '../containers/MapToolbarContainer';
import FollowMapButtonContainer from '../containers/FollowMapButtonContainer';
import SwipeableViews from 'react-swipeable-views';

const styles = {
  skeltonThumbnail: {
    height: '100%'
  },
  skeltonThumbnailDisable: {
    height: 0
  },
  skeltonMapName: {
    width: '100%',
    height: '1.5rem'
  },
  skeltonMapDescription: {
    width: '70%',
    height: '0.875rem'
  },
  cardContainerLarge: {
    position: 'absolute',
    top: 64,
    bottom: 0,
    width: 350,
    zIndex: 1
  },
  cardContainerSmall: {
    paddingTop: 0,
    paddingBottom: 0
  },
  cardLarge: {
    height: '100%',
    overflowY: 'scroll',
    minHeight: 'calc(100vh - 64px)'
  },
  cardSmall: {
    height: '100%',
    position: 'absolute',
    width: '100%',
    overflowY: 'scroll',
    minHeight: '100%'
  },
  cardContentSmall: {
    textAlign: 'center'
  },
  activityText: {
    paddingRight: 32,
    fontSize: 14
  },
  spotImage: {
    width: 40,
    height: 40
  },
  tab: {
    minWidth: 0,
    width: 110
  },
  secondaryAvatar: {
    borderRadius: 0,
    marginRight: 12,
    cursor: 'pointer'
  },
  mapTypeIcon: {
    marginLeft: 8
  },
  mapTypeContainer: {
    verticalAlign: 'middle'
  },
  followMapButton: {
    marginTop: 16
  }
};

class MapSummary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 0
    };
    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleSwipeChange = this.handleSwipeChange.bind(this);
  }

  handleTabChange(e, value) {
    this.setState({
      tabValue: value
    });
  }

  handleSwipeChange(value) {
    this.setState({
      tabValue: value
    });
  }

  render() {
    return <div>{this.renderMapSummary(this.props.currentMap)}</div>;
  }

  renderMapSummary(map) {
    return (
      <div
        style={
          this.props.large
            ? styles.cardContainerLarge
            : styles.cardContainerSmall
        }
      >
        <MapToolbarContainer skelton showCloseButton={this.props.dialogMode} />
        <Card style={this.props.large ? styles.cardLarge : styles.cardSmall}>
          <CardMedia>
            {this.renderThumbnail(map)}
          </CardMedia>
          <CardContent style={this.props.large ? {} : styles.cardContentSmall}>
            {map && map.name ? (
              <Typography
                variant="headline"
                component="h2"
                gutterBottom
              >
                {map.name} <span style={styles.mapTypeContainer}>{map.private && this.renderPrivateIcon()}</span>
              </Typography>
            ) : (
              <Chip style={styles.skeltonMapName} />
            )}
            {map && map.description ? (
              <Typography component="p">
                {map.description}
              </Typography>
            ) : (
              <Chip style={styles.skeltonMapDescription} />
            )}
            <div style={styles.followMapButton}>
              <FollowMapButtonContainer currentMap={this.props.currentMap} />
            </div>
          </CardContent>
          <Divider />
          <Tabs
            value={this.state.tabValue}
            onChange={this.handleTabChange}
            fullWidth
            centered
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab icon={<TimelineIcon />} label="TIMELINE" style={styles.tab} />
            <Tab icon={<PlaceIcon />} label="SPOTS" style={styles.tab} />
            <Tab icon={<GroupIcon />} label="FOLLOWERS" style={styles.tab} />
          </Tabs>
          <SwipeableViews
            animateHeight
            index={this.state.tabValue}
            onChangeIndex={this.handleSwipeChange}
          >
            {this.renderTimelineTab()}
            {this.renderSpotTab()}
            {this.renderMemberTab()}
          </SwipeableViews>
        </Card>
      </div>
    );
  }

  renderThumbnail(map) {
    return (
      <GridList cols={1} spacing={0} cellHeight={this.props.large ? 350 : 250}>
        <GridListTile key={map && map.id}>
          <img src={map && map.image_url ? map.image_url : ''} />
          <GridListTileBar
            style={
              map && map.image_url
                ? styles.skeltonThumbnailDisable
                : styles.skeltonThumbnail
            }
          />
        </GridListTile>
      </GridList>
    );
  }

  renderSpotTab() {
    return (
      <List disablePadding>
        {this.props.spots.length > 0
          ? this.renderSpots(this.props.spots)
          : null}
      </List>
    );
  }

  renderMemberTab() {
    return (
      <List disablePadding>
        {this.props.collaborators.length > 0
          ? this.renderCollaborators(this.props.collaborators)
          : null}
      </List>
    );
  }

  renderTimelineTab() {
    return (
      <List disablePadding>
        {this.props.mapReviews.length > 0
          ? this.renderActivities(this.props.mapReviews)
          : null}
      </List>
    );
  }

  renderCollaborators(collaborators) {
    return collaborators.map(collaborator => (
      <ListItem
        button
        key={collaborator.id}
        onClick={() => this.props.handleUserClick(collaborator.id)}
      >
        <Avatar src={collaborator.profile_image_url} />
        <ListItemText primary={collaborator.name} />
      </ListItem>
    ));
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

  renderActivities(mapReviews) {
    return mapReviews.map(review => (
      <ListItem
        button
        key={review.id}
        onClick={() => this.props.handleReviewClick(review)}
      >
        <Avatar src={review.author.profile_image_url} />
        <ListItemText
          primary={
            <div style={styles.activityText}>
              <b>{review.author.name}</b> created a report about{' '}
              <b>{review.spot.name}</b>
            </div>
          }
          secondary={this.fromNow(review)}
        />
        {review.image && (
          <ListItemSecondaryAction onClick={() => this.props.handleReviewClick(review)}>
            <Avatar src={review.image.thumbnail_url} style={styles.secondaryAvatar} />
          </ListItemSecondaryAction>
        )}
      </ListItem>
    ));
  }

  fromNow(review) {
    return moment(review.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ')
      .locale(window.currentLocale)
      .format('LL');
  }

  renderPrivateIcon() {
    return (
      <Tooltip title="Only owner and followers are available." key="private">
        <LockIcon color="inherit" style={styles.mapTypeIcon} />
      </Tooltip>
    );
  }
}

export default MapSummary;
