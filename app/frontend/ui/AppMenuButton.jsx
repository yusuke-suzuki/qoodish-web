import React from 'react';
import MenuIcon from '@material-ui/icons/Menu';
import IconButton from '@material-ui/core/IconButton';

const styles = {
  leftButton: {
    marginLeft: 8,
    color: 'white'
  }
};

export default class AppMenuButton extends React.PureComponent {
  render() {
    return (
      <IconButton
        color="inherit"
        onClick={() => this.props.handleToggleDrawer(this.props.drawerOpen)}
        style={this.props.large ? {} : styles.leftButton}
      >
        <MenuIcon />
      </IconButton>
    );
  }
}
