import React from 'react';

import ShareIcon from '@material-ui/icons/Share';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import CopyToClipboard from 'react-copy-to-clipboard';
import I18n from '../containers/I18n';

import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
} from 'react-share';

class ReviewShareMenu extends React.PureComponent {
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

  shareUrl(review) {
    return review ? `${process.env.ENDPOINT}/maps/${review.map.id}/reports/${review.id}` : '';
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

  renderShareButton() {
    return (
      <IconButton
        aria-label="More share"
        aria-owns={this.state.shareMenuOpen ? 'share-menu' : null}
        aria-haspopup="true"
        onClick={this.handleShareButtonClick}
      >
        <ShareIcon />
      </IconButton>
    );
  }

  renderMenu(review) {
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
          url={this.shareUrl(review)}
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
          url={this.shareUrl()}
          title={`${review.spot.name} - ${review.map.name}`}
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
          text={`${process.env.ENDPOINT}/maps/${review.map.id}/reports/${review.id}`}
          onCopy={this.props.handleUrlCopied}
          key="copy"
        >
          <MenuItem
            key="copy-link"
            onClick={this.handleRequestShareMenuClose}
          >
            <ListItemIcon>
              <FileCopyIcon />
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
        {this.renderShareButton()}
        {this.props.currentReview && this.renderMenu(this.props.currentReview)}
      </div>
    );
  }
}

export default ReviewShareMenu;
