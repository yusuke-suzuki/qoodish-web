import React from 'react';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import ReportProblemIcon from '@material-ui/icons/ReportProblem';
import PersonAddIcon from '@material-ui/icons/PersonAdd';

import I18n from '../containers/I18n';

const styles = {
  mapMenuIcon: {
    color: 'white'
  }
};

class MapVertMenu extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      anchorElVert: undefined,
      vertMenuOpen: false
    };
    this.handleVertButtonClick = this.handleVertButtonClick.bind(this);
    this.handleRequestVertMenuClose = this.handleRequestVertMenuClose.bind(
      this
    );
  }

  isInvitable(map) {
    return map && map.private && (map.editable || map.invitable);
  };

  handleVertButtonClick(event) {
    this.setState({
      vertMenuOpen: true,
      anchorElVert: event.currentTarget
    });
  }

  handleRequestVertMenuClose() {
    this.setState({
      vertMenuOpen: false
    });
  }

  renderMenuButton() {
    return (
      <IconButton
        aria-label="More vert"
        aria-owns={this.state.vertMenuOpen ? 'vert-menu' : null}
        aria-haspopup="true"
        onClick={this.handleVertButtonClick}
      >
        <MoreVertIcon style={styles.mapMenuIcon} />
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
        {this.isInvitable(this.props.currentMap) && this.renderInviteButton()}
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

  renderInviteButton() {
    return (
      <MenuItem
        key="invite"
        onClick={() => {
          this.handleRequestVertMenuClose();
          this.props.handleInviteButtonClick();
        }}
      >
        <ListItemIcon>
          <PersonAddIcon />
        </ListItemIcon>
        <ListItemText
          primary={I18n.t('invite')}
        />
      </MenuItem>
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

  render() {
    return (
      <div>
        {this.renderMenuButton()}
        {this.props.currentMap && this.renderMenu(this.props.currentMap)}
      </div>
    );
  }
}

export default MapVertMenu;
