import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import I18n from '../containers/I18n';

const styles = {
  profileAvatar: {
    width: 35,
    height: 35,
  }
};

class AvatarMenu extends React.PureComponent {
  constructor(props) {
    super(props);
    this.handleAvatarClick = this.handleAvatarClick.bind(this);
    this.handleRequestAvatarMenuClose = this.handleRequestAvatarMenuClose.bind(
      this
    );

    this.state = {
      anchorEl: undefined,
      accountMenuOpen: false
    };
  }

  handleAvatarClick(event) {
    this.setState({
      accountMenuOpen: true,
      anchorEl: event.currentTarget
    });
  }

  handleRequestAvatarMenuClose(event) {
    this.setState({
      accountMenuOpen: false
    });
  }

  render() {
    return (
      <div>
        {this.renderAvatar()}
        {this.renderMenu()}
      </div>
    );
  }

  renderAvatar() {
    return (
      <IconButton
        aria-label="Account"
        aria-owns={this.state.accountMenuOpen ? 'account-menu' : null}
        aria-haspopup="true"
        onClick={this.handleAvatarClick}
      >
        <Avatar
          src={this.props.currentUser ? this.props.currentUser.thumbnail_url : ''}
          style={styles.profileAvatar}
        />
        {this.renderMenu()}
      </IconButton>
    );
  }

  renderMenu() {
    return (
      <Menu
        id="account-menu"
        anchorEl={this.state.anchorEl}
        open={this.state.accountMenuOpen}
        onClose={this.handleRequestAvatarMenuClose}
      >
        <MenuItem
          onClick={this.handleRequestAvatarMenuClose}
          selected={false}
          component={Link}
          to="/profile"
          title={I18n.t('account')}
        >
          {I18n.t('account')}
        </MenuItem>
        <MenuItem
          onClick={this.handleRequestAvatarMenuClose}
          selected={false}
          component={Link}
          to="/settings"
          title={I18n.t('settings')}
        >
          {I18n.t('settings')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            this.handleRequestAvatarMenuClose();
            this.props.signOut();
          }}
        >
          {I18n.t('logout')}
        </MenuItem>
      </Menu>
    );
  }
}

export default AvatarMenu;
