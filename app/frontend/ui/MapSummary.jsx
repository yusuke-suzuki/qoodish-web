import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import ArrowBackIcon from 'material-ui-icons/ArrowBack';
import Slide from 'material-ui/transitions/Slide';
import Button from 'material-ui/Button';
import List, {
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import Card, { CardContent, CardMedia } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import Collapse from 'material-ui/transitions/Collapse';
import Menu, { MenuItem } from 'material-ui/Menu';
import MoreVertIcon from 'material-ui-icons/MoreVert';
import Toolbar from 'material-ui/Toolbar';
import ShareIcon from 'material-ui-icons/Share';
import Divider from 'material-ui/Divider';
import PlaceIcon from 'material-ui-icons/Place';
import PersonAddIcon from 'material-ui-icons/PersonAdd';
import TimelineIcon from 'material-ui-icons/Timeline';
import CopyToClipboard from 'react-copy-to-clipboard';
import Tabs, { Tab } from 'material-ui/Tabs';
import moment from 'moment';
import Chip from 'material-ui/Chip';
import GridList, { GridListTile, GridListTileBar } from 'material-ui/GridList';
import LockIcon from 'material-ui-icons/Lock';
import GroupIcon from 'material-ui-icons/Group';
import PersonIcon from 'material-ui-icons/Person';
import Tooltip from 'material-ui/Tooltip';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
import ButtonBase from 'material-ui/ButtonBase';

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
    paddingTop: 56,
    paddingBottom: 56
  },
  cardLarge: {
    height: '100%',
    overflowY: 'scroll',
    minHeight: 'calc(100vh - 64px)'
  },
  cardSmall: {
    height: '100%',
    width: '100%',
    minHeight: 'calc(100vh - 112px)'
  },
  cardContentSmall: {
    textAlign: 'center'
  },
  mapSummaryText: {
    wordWrap: 'break-word'
  },
  mapToolbar: {
    backgroundImage: 'linear-gradient(to bottom,rgba(0,0,0,.5),rgba(0,0,0,0))',
    position: 'absolute',
    zIndex: 1,
    right: 0,
    left: 0
  },
  toolbar: {
    cursor: 'pointer'
  },
  toolbarActions: {
    marginLeft: 'auto'
  },
  mapMenuIcon: {
    color: 'white'
  },
  activityText: {
    paddingRight: 32,
    fontSize: 14
  },
  spotImage: {
    width: 40,
    height: 40
  },
  roleButtonContainer: {
    marginTop: 16
  },
  tab: {
    minWidth: 0,
    width: 110
  },
  secondaryAvatar: {
    borderRadius: 0,
    marginRight: 12
  },
  mapTypeIcon: {
    marginLeft: 8
  },
  mapTypeContainer: {
    verticalAlign: 'middle'
  },
  mapButton: {
    marginTop: 16
  },
  mapCover: {
    position: 'absolute',
    zIndex: 1,
    height: 100,
    width: '100%',
    left: 16,
    right: 16
  },
  mapWrapper: {
    height: 100
  },
  mapContainer: {
    height: '100%'
  }
};

const GoogleMapContainer = withScriptjs(withGoogleMap(props => (
  <GoogleMap
    defaultZoom={12}
    options={{
      zoomControl: false,
      streetViewControl: false,
      scaleControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      gestureHandling: 'none'
    }}
    center={
      new google.maps.LatLng(
        parseFloat(props.center.lat),
        parseFloat(props.center.lng)
      )
    }
    onClick={props.handleMapButtonClick}
  >
  </GoogleMap>
)));

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class MapSummary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorElShare: undefined,
      shareMenuOpen: false,
      anchorElVert: undefined,
      vertMenuOpen: false,
      tabValue: 0
    };
    this.handleShareButtonClick = this.handleShareButtonClick.bind(this);
    this.handleVertButtonClick = this.handleVertButtonClick.bind(this);
    this.handleRequestShareMenuClose = this.handleRequestShareMenuClose.bind(
      this
    );
    this.handleRequestVertMenuClose = this.handleRequestVertMenuClose.bind(
      this
    );
    this.handleTabChange = this.handleTabChange.bind(this);
  }

  handleShareButtonClick(event) {
    this.setState({
      shareMenuOpen: true,
      anchorElShare: event.currentTarget
    });
  }

  handleVertButtonClick(event) {
    this.setState({
      vertMenuOpen: true,
      anchorElVert: event.currentTarget
    });
  }

  handleRequestShareMenuClose() {
    this.setState({
      shareMenuOpen: false
    });
  }

  handleRequestVertMenuClose() {
    this.setState({
      vertMenuOpen: false
    });
  }

  handleTabChange(e, value) {
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
        {this.renderMapToolbar(map)}
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
                style={styles.mapSummaryText}
              >
                {map.name} <span style={styles.mapTypeContainer}>{this.renderMapTypeIcon(map)}</span>
              </Typography>
            ) : (
              <Chip style={styles.skeltonMapName} />
            )}
            {map && map.description ? (
              <Typography component="p" style={styles.mapSummaryText}>
                {map.description}
              </Typography>
            ) : (
              <Chip style={styles.skeltonMapDescription} />
            )}
            <div style={styles.roleButtonContainer}>
              {map ? (
                this.renderRoleButton(map)
              ) : (
                <Button variant="raised" color="secondary" disabled>{''}</Button>
              )}
            </div>
            {!this.props.large && this.renderMapButton()}
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
          <div>
            {this.state.tabValue === 0 && this.renderTimelineTab()}
            {this.state.tabValue === 1 && this.renderSpotTab()}
            {this.state.tabValue === 2 && this.renderMemberTab()}
          </div>
        </Card>
      </div>
    );
  }

  renderMapButton() {
    return (
      <div style={styles.mapButton}>
        {this.renderMapCover()}
        {this.renderGoogleMap()}
      </div>
    );
  }

  renderMapCover() {
    return (
      <ButtonBase
        style={styles.mapCover}
        onClick={this.props.handleMapButtonClick}
      />
    );
  }

  renderGoogleMap() {
    return (
      <GoogleMapContainer
        {...this.props}
        googleMapURL={process.env.GOOGLE_MAP_URL}
        containerElement={
          <div style={styles.mapWrapper} />
        }
        mapElement={<div style={styles.mapContainer} />}
        loadingElement={<div style={{ height: '100%' }} />}
      />
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

  renderMapToolbar(map) {
    return (
      <Toolbar style={styles.mapToolbar} disableGutters>
        <div style={styles.toolbarActions}>
          {map && map.private && (map.editable || map.invitable) && this.renderInviteButton()}
          <IconButton
            aria-label="More share"
            aria-owns={this.state.shareMenuOpen ? 'share-menu' : null}
            aria-haspopup="true"
            onClick={this.handleShareButtonClick}
          >
            <ShareIcon style={styles.mapMenuIcon} />
          </IconButton>
          <Menu
            id="share-menu"
            anchorEl={this.state.anchorElShare}
            open={this.state.shareMenuOpen}
            onClose={this.handleRequestShareMenuClose}
          >
            <MenuItem
              key="facebook"
              onClick={() => {
                this.handleRequestShareMenuClose();
                this.props.handleFacebookButtonClick(map);
              }}
            >
              Share with Facebook
            </MenuItem>
            <MenuItem
              key="twitter"
              onClick={() => {
                this.handleRequestShareMenuClose();
                this.props.handleTweetButtonClick(map);
              }}
            >
              Share with Twitter
            </MenuItem>
            <CopyToClipboard
              text={`${process.env.ENDPOINT}/maps/${map && map.id}`}
              onCopy={this.props.handleUrlCopied}
              key="copy"
            >
              <MenuItem key="copy" onClick={this.handleRequestShareMenuClose}>
                Copy link
              </MenuItem>
            </CopyToClipboard>
          </Menu>
          <IconButton
            aria-label="More vert"
            aria-owns={this.state.vertMenuOpen ? 'vert-menu' : null}
            aria-haspopup="true"
            onClick={this.handleVertButtonClick}
          >
            <MoreVertIcon style={styles.mapMenuIcon} />
          </IconButton>
          {map && this.renderMenu(map)}
        </div>
      </Toolbar>
    );
  }

  renderInviteButton() {
    return (
      <IconButton
        onClick={this.props.handleInviteButtonClick}
      >
        <PersonAddIcon style={styles.mapMenuIcon} />
      </IconButton>
    );
  }

  renderMenu(map) {
    return map.editable
      ? this.renderMenuForOwner()
      : this.renderMenuForMember();
  }

  renderMenuForOwner() {
    return (
      <Menu
        id="vert-menu"
        anchorEl={this.state.anchorElVert}
        open={this.state.vertMenuOpen}
        onClose={this.handleRequestVertMenuClose}
      >
        {this.renderEditButton()}
        {this.renderDeleteButton()}
      </Menu>
    );
  }

  renderMenuForMember() {
    return (
      <Menu
        id="vert-menu"
        anchorEl={this.state.anchorElVert}
        open={this.state.vertMenuOpen}
        onClose={this.handleRequestVertMenuClose}
      >
        <MenuItem
          key="issue"
          onClick={() => {
            this.handleRequestVertMenuClose();
            this.props.handleIssueButtonClick(this.props.currentMap);
          }}
        >
          Issue
        </MenuItem>
      </Menu>
    );
  }

  renderEditButton() {
    return (
      <MenuItem
        key="edit"
        onClick={() => {
          this.handleRequestVertMenuClose();
          this.props.handleEditMapButtonClick(this.props.currentMap);
        }}
      >
        Edit
      </MenuItem>
    );
  }

  renderDeleteButton() {
    return (
      <MenuItem
        key="delete"
        onClick={() => {
          this.handleRequestVertMenuClose();
          this.props.handleDeleteMapButtonClick(this.props.currentMap);
        }}
      >
        Delete
      </MenuItem>
    );
  }

  renderRoleButton(map) {
    if (map.editable) {
      return (
        <Button variant="raised" disabled>
          OWNER
        </Button>
      );
    } else if (map.following) {
      return (
        <Button variant="raised" onClick={this.props.handleLeaveButtonClick}>
          UNFOLLOW
        </Button>
      );
    } else {
      return (
        <Button
          variant="raised"
          onClick={this.props.handleJoinButtonClick}
          color="primary"
        >
          FOLLOW
        </Button>
      );
    }
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
        onClick={() => this.props.handleSpotClick(spot, this.props.large)}
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
          <ListItemSecondaryAction>
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

  renderMapTypeIcon(map) {
    let actions = [];
    if (map.private) {
      actions.push(
        <Tooltip title="Only owner and followers are available." key="private">
          <LockIcon color="inherit" style={styles.mapTypeIcon} />
        </Tooltip>
      );
    }
    if (map.shared) {
      actions.push(
        <Tooltip title="Owner and followers can post reports." key="shared">
          <GroupIcon color="inherit" style={styles.mapTypeIcon} />
        </Tooltip>
      );
    } else {
      actions.push(
        <Tooltip title="Only owner can post reports." key="personal">
          <PersonIcon color="inherit" style={styles.mapTypeIcon} />
        </Tooltip>
      );
    }
    return actions;
  }
}

export default MapSummary;
