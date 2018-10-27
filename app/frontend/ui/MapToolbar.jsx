import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Toolbar from '@material-ui/core/Toolbar';
import ShareIcon from '@material-ui/icons/Share';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Typography from '@material-ui/core/Typography';
import ContentCopyIcon from '@material-ui/icons/ContentCopy';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import ReportProblemIcon from '@material-ui/icons/ReportProblem';
import CopyToClipboard from 'react-copy-to-clipboard';
import LockIcon from '@material-ui/icons/Lock';
import Tooltip from '@material-ui/core/Tooltip';
import I18n from '../containers/I18n';
import AppMenuButtonContainer from '../containers/AppMenuButtonContainer';
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
} from 'react-share';

const styles = {
  leftButton: {
    marginLeft: 8,
    color: 'white'
  },
  mapToolbarLarge: {
    paddingLeft: 10
  },
  mapToolbarSmall: {
  },
  toolbarActions: {
    marginLeft: 'auto',
    display: 'flex',
  },
  mapMenuIcon: {
    color: 'white'
  },
  mapName: {
    cursor: 'pointer',
    marginLeft: 4
  },
  mapTypeIcon: {
    marginRight: 6
  }
};

class MapToolbar extends React.PureComponent {
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
    return this.renderToolbar(this.props.currentMap);
  }

  shareUrl(map) {
    return map ? `${process.env.ENDPOINT}/maps/${map.id}` : '';
  }

  renderToolbar(map) {
    return (
      <Toolbar style={this.props.large ? styles.mapToolbarLarge : styles.mapToolbarSmall} disableGutters>
        {this.props.showBackButton && this.renderBackButton()}
        {this.props.showMenuButton && <AppMenuButtonContainer />}
        {map && map.private && this.renderPrivateIcon()}
        {this.props.showMapName && map && this.renderMapName(map)}
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
              onClick={this.handleRequestShareMenuClose}
              component={FacebookShareButton}
              url={this.shareUrl(map)}
            >
              <ListItemIcon>
                <FacebookIcon
                  round
                  size={24}
                />
              </ListItemIcon>
              <ListItemText
                primary={I18n.t('share with facebook')}
              />
            </MenuItem>
            <MenuItem
              key="twitter"
              onClick={this.handleRequestShareMenuClose}
              component={TwitterShareButton}
              url={this.shareUrl(map)}
              title={map && map.name}
            >
              <ListItemIcon>
                <TwitterIcon
                  round
                  size={24}
                />
              </ListItemIcon>
              <ListItemText
                primary={I18n.t('share with twitter')}
              />
            </MenuItem>
            <CopyToClipboard
              text={`${process.env.ENDPOINT}/maps/${map && map.id}`}
              onCopy={this.props.handleUrlCopied}
              key="copy"
            >
              <MenuItem
                key="copy"
                onClick={this.handleRequestShareMenuClose}
              >
                <ListItemIcon>
                  <ContentCopyIcon />
                </ListItemIcon>
                <ListItemText primary={I18n.t('copy link')} />
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

  renderMapName(map) {
    return (
      <Typography
        variant="h6"
        color="inherit"
        noWrap
        style={styles.mapName}
      >
        {map.name}
      </Typography>
    );
  }

  renderPrivateIcon() {
    return (
      <Tooltip title={I18n.t('this map is private')}>
        <LockIcon color="inherit" style={styles.mapTypeIcon} fontSize="small" />
      </Tooltip>
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
          <ListItemIcon>
            <ReportProblemIcon />
          </ListItemIcon>
          <ListItemText
            primary={I18n.t('report')}
          />
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
        <ListItemIcon>
          <EditIcon />
        </ListItemIcon>
        <ListItemText
          primary={I18n.t('edit')}
        />
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
        <ListItemIcon>
          <DeleteIcon />
        </ListItemIcon>
        <ListItemText
          primary={I18n.t('delete')}
        />
      </MenuItem>
    );
  }
}

export default MapToolbar;
