import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import CloseIcon from '@material-ui/icons/Close';

const styles = {
  appbar: {
    position: 'relative'
  },
  actionButton: {
    marginLeft: 'auto'
  },
  closeButton: {
    marginRight: 8
  }
};

const ExitIcon = React.memo(props => {
  switch (props.iconType) {
    case 'back':
      return <ArrowBackIcon />;
    default:
      return <CloseIcon />;
  }
});

const DialogAppBar = props => {
  return (
    <AppBar
      style={styles.appbar}
      color={props.color ? props.color : 'primary'}
      elevation={1}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          onClick={props.handleRequestDialogClose}
          style={styles.closeButton}
        >
          <ExitIcon iconType={props.iconType} />
        </IconButton>
        <Typography variant="h6" color="inherit" noWrap>
          {props.title}
        </Typography>
        {props.action && <div style={styles.actionButton}>{props.action}</div>}
      </Toolbar>
    </AppBar>
  );
};

export default React.memo(DialogAppBar);
