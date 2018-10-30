import React from 'react';
import MenuIcon from '@material-ui/icons/Menu';
import IconButton from '@material-ui/core/IconButton';

const styles = {
  leftButton: {
    position: 'absolute',
    marginLeft: 8,
    color: 'white'
  }
};

const AppMenuButton = (props) => {
  return (
    <IconButton
      color="inherit"
      onClick={() => props.handleToggleDrawer(props.drawerOpen)}
      style={props.large ? {} : styles.leftButton}
    >
      <MenuIcon />
    </IconButton>
  );
}

export default AppMenuButton;
