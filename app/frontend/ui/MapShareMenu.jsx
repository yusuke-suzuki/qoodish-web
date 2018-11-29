import React from 'react';

import ShareIcon from '@material-ui/icons/Share';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ContentCopyIcon from '@material-ui/icons/ContentCopy';

import CopyToClipboard from 'react-copy-to-clipboard';
import I18n from '../containers/I18n';

import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
} from 'react-share';

const styles = {
  mapMenuIcon: {
    color: 'white'
  }
};

class MapShareMenu extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      anchorElShare: undefined,
      shareMenuOpen: false
    };
    this.handleShareButtonClick = this.handleShareButtonClick.bind(this);
    this.handleRequestShareMenuClose = this.handleRequestShareMenuClose.bind(
      this
    );
  }

  shareUrl(map) {
    return map ? `${process.env.ENDPOINT}/maps/${map.id}` : '';
  }

  handleShareButtonClick(event) {
    this.setState({
      shareMenuOpen: true,
      anchorElShare: event.currentTarget
    });
  }

  handleRequestShareMenuClose() {
    this.setState({
      shareMenuOpen: false
    });
  }

  renderMenuButton() {
    return (
      <IconButton
        aria-label="More share"
        aria-owns={this.state.shareMenuOpen ? 'share-menu' : null}
        aria-haspopup="true"
        onClick={this.handleShareButtonClick}
      >
        <ShareIcon style={styles.mapMenuIcon} />
      </IconButton>
    );
  }

  renderMenu(map) {
    return (
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
    );
  }

  render() {
    return (
      <div>
        {this.renderMenuButton()}
        {this.props.currentMap && this.renderMenu(this.props.currentMap)}
      </div>
    );
  }
}

export default MapShareMenu;
