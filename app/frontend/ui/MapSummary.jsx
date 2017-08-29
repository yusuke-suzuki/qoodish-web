import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import Drawer from 'material-ui/Drawer';
import Button from 'material-ui/Button';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import Collapse from 'material-ui/transitions/Collapse';
import Menu, { MenuItem } from 'material-ui/Menu';
import MoreVertIcon from 'material-ui-icons/MoreVert';
import Toolbar from 'material-ui/Toolbar';
import ShareIcon from 'material-ui-icons/Share';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import Divider from 'material-ui/Divider';
import GroupIcon from 'material-ui-icons/Group';
import PlaceIcon from 'material-ui-icons/Place';
import openJoinMapDialog from '../actions/openJoinMapDialog';
import openLeaveMapDialog from '../actions/openLeaveMapDialog';
import CopyToClipboard from 'react-copy-to-clipboard';

const styles = {
  drawer: {
    position: 'fixed'
  },
  cardContainer: {
    marginTop: 64,
    width: 330,
    height: 'calc(100% - 64px)',
    overflow: 'hidden'
  },
  card: {
    height: '100%',
    overflowY: 'scroll'
  },
  media: {
    width: '100%'
  },
  mapToolbar: {
    backgroundImage: 'linear-gradient(to bottom,rgba(0,0,0,.5),rgba(0,0,0,0))',
    position: 'absolute',
    zIndex: 1,
    right: 0,
    left: 0,
    paddingLeft: 15,
    paddingRight: 15
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
  expandOpen: {
    transform: 'rotate(180deg)'
  },
  expandTitle: {
    paddingLeft: 16,
    display: 'inline-flex'
  },
  expandContentIcon: {
    marginRight: 10
  },
  listItemContent: {
    overflow: 'hidden'
  },
  listItemText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  spotImage: {
    width: 40,
    height: 40
  }
};

class MapSummary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collaboratorExpanded: true,
      spotExpanded: true,
      anchorElShare: undefined,
      shareMenuOpen: false,
      anchorElVert: undefined,
      vertMenuOpen: false
    };
    this.handleExpandCollaboratorClick = this.handleExpandCollaboratorClick.bind(this);
    this.handleExpandSpotClick = this.handleExpandSpotClick.bind(this);
    this.handleSpotClick = this.handleSpotClick.bind(this);
    this.handleShareButtonClick = this.handleShareButtonClick.bind(this);
    this.handleVertButtonClick = this.handleVertButtonClick.bind(this);
    this.handleRequestShareMenuClose = this.handleRequestShareMenuClose.bind(this);
    this.handleRequestVertMenuClose = this.handleRequestVertMenuClose.bind(this);
  }

  handleExpandCollaboratorClick() {
    this.setState({
      collaboratorExpanded: !this.state.collaboratorExpanded
    });
  }

  handleExpandSpotClick() {
    this.setState({
      spotExpanded: !this.state.spotExpanded
    });
  }

  handleSpotClick(spot) {
    this.props.requestSpotPosition(spot);
    this.props.onSpotMarkerClick(spot);
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

  render() {
    return (
      <Drawer
        open={this.props.drawerOpen}
        docked
        style={styles.drawer}
      >
        {this.props.currentMap ? this.renderMapSummary(this.props.currentMap) : null}
      </Drawer>
    );
  }

  renderMapSummary(map) {
    return (
      <div style={styles.cardContainer}>
        {this.renderMapToolbar()}
        <Card style={styles.card}>
          <CardMedia>
            <img src={map.image_url} style={styles.media} />
          </CardMedia>
          <CardContent>
            <Typography type='headline' component='h2' gutterBottom>
              {map.name}
            </Typography>
            <Typography component='p'>
              {map.description}
            </Typography>
          </CardContent>
          <CardActions>
            {this.renderRoleButton(map)}
          </CardActions>
          <Divider />
          <Toolbar style={styles.toolbar} disableGutters onClick={this.handleExpandSpotClick}>
            <Typography style={styles.expandTitle} type='title' color='secondary'>
              <PlaceIcon style={styles.expandContentIcon} /> Spots
            </Typography>
            <div style={styles.toolbarActions}>
              <IconButton
                aria-expanded={this.state.spotExpanded}
                aria-label='Show more'
               >
                 <ExpandMoreIcon style={this.state.spotExpanded ? styles.expandOpen : {}} />
              </IconButton>
            </div>
          </Toolbar>
          <Collapse in={this.state.spotExpanded} transitionDuration='auto' unmountOnExit>
            <List disablePadding>
              {this.props.spots.length > 0 ? this.renderSpots(this.props.spots) : null}
            </List>
          </Collapse>
          <Divider />
          <Toolbar style={styles.toolbar} disableGutters onClick={this.handleExpandCollaboratorClick}>
            <Typography style={styles.expandTitle} type='title' color='secondary'>
              <GroupIcon style={styles.expandContentIcon}/> Collaborators
            </Typography>
            <div style={styles.toolbarActions}>
              <IconButton
                aria-expanded={this.state.collaboratorExpanded}
                aria-label='Show more'
               >
                 <ExpandMoreIcon style={this.state.collaboratorExpanded ? styles.expandOpen : {}} />
              </IconButton>
            </div>
          </Toolbar>
          <Collapse in={this.state.collaboratorExpanded} transitionDuration='auto' unmountOnExit>
            <List disablePadding>
              {this.props.collaborators.length > 0 ? this.renderCollaborators(this.props.collaborators) : null}
            </List>
          </Collapse>
        </Card>
      </div>
    );
  }

  renderMapToolbar() {
    return (
      <Toolbar style={styles.mapToolbar} disableGutters>
        <div style={styles.toolbarActions}>
          <IconButton
            color='contrast'
            aria-label='More share'
            aria-owns={this.state.shareMenuOpen ? 'share-menu' : null}
            aria-haspopup='true'
            onClick={this.handleShareButtonClick}
          >
            <ShareIcon style={styles.mapMenuIcon} />
          </IconButton>
          <Menu
            id='share-menu'
            anchorEl={this.state.anchorElShare}
            open={this.state.shareMenuOpen}
            onRequestClose={this.handleRequestShareMenuClose}
          >
            <MenuItem
              key='facebook'
              onClick={() => {
                this.handleRequestShareMenuClose();
                this.props.handleFacebookButtonClick(this.props.currentMap);;
              }}
            >
              Share with Facebook
            </MenuItem>
            <MenuItem
              key='twitter'
              onClick={() => {
                this.handleRequestShareMenuClose();
                this.props.handleTweetButtonClick(this.props.currentMap)
              }}
            >
              Share with Twitter
            </MenuItem>
            <CopyToClipboard
              text={`${process.env.ENDPOINT}/maps/${this.props.currentMap.id}`}
              onCopy={this.props.handleUrlCopied}
              key='copy'
            >
              <MenuItem key='copy' onClick={this.handleRequestShareMenuClose}>
                Copy link to this map
              </MenuItem>
            </CopyToClipboard>
          </Menu>
          <IconButton
            color='contrast'
            aria-label='More vert'
            aria-owns={this.state.vertMenuOpen ? 'vert-menu' : null}
            aria-haspopup='true'
            onClick={this.handleVertButtonClick}
          >
            <MoreVertIcon style={styles.mapMenuIcon} />
          </IconButton>
          <Menu
            id='vert-menu'
            anchorEl={this.state.anchorElVert}
            open={this.state.vertMenuOpen}
            onRequestClose={this.handleRequestVertMenuClose}
          >
            {() => {
              if (this.props.currentMap.editable) {
                this.renderEditButton();
              }
            }}
            {() => {
              if (this.props.currentMap.editable) {
                this.renderDeleteButton();
              }
            }}
            <MenuItem
              key='issue'
              onClick={() => {
                this.handleRequestVertMenuClose();
                this.props.handleIssueButtonClick(this.props.currentMap);
              }}
            >
              Issue
            </MenuItem>
          </Menu>
        </div>
      </Toolbar>
    );
  }

  renderEditButton() {
    return (
      <MenuItem
        key='edit'
        onClick={() => {
          this.handleRequestVertMenuClose();
          this.props.handleEditMapButtonClick();
        }}
      >
        Edit
      </MenuItem>
    );
  }

  renderDeleteButton() {
    return (
      <MenuItem
        key='delete'
        onClick={() => {
          this.handleRequestVertMenuClose();
          this.props.handleDeleteMapButtonClick();
        }}
      >
        Delete
      </MenuItem>
    );
  }

  renderRoleButton(map) {
    if (map.editable) {
      return (
        <Button raised disabled>
          Owner
        </Button>
      );
    } else if (map.following) {
      return (
        <Button raised onClick={this.props.handleLeaveButtonClick}>
          Leave
        </Button>
      ) ;
    } else {
      return (
        <Button raised onClick={this.props.handleJoinButtonClick} color='primary'>
          Join
        </Button>
      );
    }
  }

  renderCollaborators(collaborators) {
    return collaborators.map((collaborator) => (
      <ListItem button key={collaborator.id}>
        <Avatar src={collaborator.profile_image_url} />
        <ListItemText
          primary={<div style={styles.listItemText}>{collaborator.name}</div>}
          style={styles.listItemContent}
        />
      </ListItem>
    ));
  }

  renderSpots(spots) {
    return spots.map((spot) => (
      <ListItem button key={spot.place_id} onClick={() => this.handleSpotClick(spot)}>
        <Avatar>
          <img src={spot.image_url} style={styles.spotImage} />
        </Avatar>
        <ListItemText
          disableTypography={true}
          primary={
            <Typography type='subheading' style={styles.listItemText}>
              {spot.name}
            </Typography>
          }
          secondary={
            <Typography component='p' style={styles.listItemText} color='secondary'>
              {spot.formatted_address}
            </Typography>
          }
          style={styles.listItemContent}
        />
      </ListItem>
    ));
  }
}

export default MapSummary;
