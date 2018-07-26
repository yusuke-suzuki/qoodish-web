import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Toolbar from '@material-ui/core/Toolbar';
import ShareIcon from '@material-ui/icons/Share';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import CopyToClipboard from 'react-copy-to-clipboard';

const styles = {
  leftButton: {
    marginLeft: 8,
    color: 'white'
  },
  mapToolbarSkelton: {
    backgroundImage: 'linear-gradient(to bottom,rgba(0,0,0,.5),rgba(0,0,0,0))',
    position: 'absolute',
    zIndex: 1,
    right: 0,
    left: 0
  },
  toolbarActions: {
    marginLeft: 'auto',
    display: 'flex',
    paddingLeft: 12
  },
  mapMenuIcon: {
    color: 'white'
  },
  mapName: {
    cursor: 'pointer',
    marginLeft: 8
  },
};

class MapToolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorElShare: undefined,
      shareMenuOpen: false,
      anchorElVert: undefined,
      vertMenuOpen: false
    };
    this.handleShareButtonClick = this.handleShareButtonClick.bind(this);
    this.handleVertButtonClick = this.handleVertButtonClick.bind(this);
    this.handleRequestShareMenuClose = this.handleRequestShareMenuClose.bind(
      this
    );
    this.handleRequestVertMenuClose = this.handleRequestVertMenuClose.bind(
      this
    );
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
    return this.props.currentMap && this.renderToolbar(this.props.currentMap);
  }

  renderToolbar(map) {
    return (
      <Toolbar style={this.props.skelton ? styles.mapToolbarSkelton : styles.mapToolbar} disableGutters>
        {this.props.showBackButton && this.renderBackButton()}
        {this.props.showCloseButton && this.renderCloseButton()}
        {this.props.showMapName && this.renderMapName()}
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

  renderBackButton() {
    return (
      <IconButton
        color="inherit"
        onClick={this.props.handleBackButtonClick}
        style={this.props.large ? {} : styles.leftButton}
      >
        <ArrowBackIcon />
      </IconButton>
    );
  }

  renderCloseButton() {
    return (
      <IconButton
        color="inherit"
        onClick={this.props.handleRequestClose}
        aria-label="Close"
        style={this.props.large ? {} : styles.leftButton}
      >
        <CloseIcon />
      </IconButton>
    );
  }

  renderMapName() {
    return (
      <Typography
        variant="headline"
        color="inherit"
        noWrap
        style={styles.mapName}
      >
        {this.props.currentMap && this.props.currentMap.name}
      </Typography>
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
            this.props.handleIssueButtonClick(this.props.currentUser, this.props.currentMap);
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
}

export default MapToolbar;
