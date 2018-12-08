import React from 'react';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DeleteIcon from '@material-ui/icons/Delete';
import ReportProblemIcon from '@material-ui/icons/ReportProblem';

import I18n from '../containers/I18n';

class CommentMenu extends React.PureComponent {
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
        <MoreVertIcon />
      </IconButton>
    );
  }

  renderMenu(comment) {
    return comment.editable
      ? this.renderMenuForAuthor()
      : this.renderMenuForAudience();
  }

  renderMenuForAuthor() {
    return (
      <Menu
        id="vert-menu"
        anchorEl={this.state.anchorElVert}
        open={this.state.vertMenuOpen}
        onClose={this.handleRequestVertMenuClose}
      >
        {this.renderDeleteButton()}
      </Menu>
    );
  }

  renderMenuForAudience() {
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
            this.props.handleIssueButtonClick(this.props.currentUser, this.props.comment);
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

  renderDeleteButton() {
    return (
      <MenuItem
        key="delete"
        onClick={() => {
          this.handleRequestVertMenuClose();
          this.props.handleDeleteCommentButtonClick(this.props.comment);
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
        {this.props.comment && this.renderMenu(this.props.comment)}
      </div>
    );
  }
}

export default CommentMenu;
