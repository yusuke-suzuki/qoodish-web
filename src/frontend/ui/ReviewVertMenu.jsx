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
import AddLocationIcon from '@material-ui/icons/AddLocation';

import I18n from '../containers/I18n';

class ReviewVertMenu extends React.PureComponent {
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

  renderMenu(review) {
    return review.editable
      ? this.renderMenuForOwner()
      : this.renderMenuForAudience();
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
        {this.renderCopyButton()}
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
            this.props.handleIssueButtonClick(
              this.props.currentUser,
              this.props.currentReview
            );
          }}
        >
          <ListItemIcon>
            <ReportProblemIcon />
          </ListItemIcon>
          <ListItemText primary={I18n.t('report')} />
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
          this.props.handleEditReviewButtonClick(this.props.currentReview);
        }}
      >
        <ListItemIcon>
          <EditIcon />
        </ListItemIcon>
        <ListItemText primary={I18n.t('edit')} />
      </MenuItem>
    );
  }

  renderCopyButton() {
    return (
      <MenuItem
        key="copy-review"
        onClick={() => {
          this.handleRequestVertMenuClose();
          this.props.handleCopyReviewButtonClick(this.props.currentReview);
        }}
      >
        <ListItemIcon>
          <AddLocationIcon />
        </ListItemIcon>
        <ListItemText primary={I18n.t('copy')} />
      </MenuItem>
    );
  }

  renderDeleteButton() {
    return (
      <MenuItem
        key="delete"
        onClick={() => {
          this.handleRequestVertMenuClose();
          this.props.handleDeleteReviewButtonClick(this.props.currentReview);
        }}
      >
        <ListItemIcon>
          <DeleteIcon />
        </ListItemIcon>
        <ListItemText primary={I18n.t('delete')} />
      </MenuItem>
    );
  }

  render() {
    return (
      <div>
        {this.renderMenuButton()}
        {this.props.currentReview && this.renderMenu(this.props.currentReview)}
      </div>
    );
  }
}

export default ReviewVertMenu;
