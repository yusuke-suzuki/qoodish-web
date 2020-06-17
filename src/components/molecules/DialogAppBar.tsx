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
  toolbar: {
    height: 56,
    paddingLeft: 8,
    paddingRight: 8
  },
  actionButton: {
    marginLeft: 'auto'
  }
};

type Props = {
  color?: string;
  iconType?: string;
  handleRequestDialogClose: Function;
  action?: Element;
  title: string;
};

const DialogAppBar: React.FC<Props> = props => {
  const { color, iconType, handleRequestDialogClose, action, title } = props;

  return (
    <AppBar
      style={styles.appbar}
      color={color ? color : 'primary'}
      elevation={2}
    >
      <Toolbar style={styles.toolbar}>
        <IconButton color="inherit" onClick={handleRequestDialogClose}>
          {iconType === 'back' ? <ArrowBackIcon /> : <CloseIcon />}
        </IconButton>
        <Typography variant="h6" color="inherit" noWrap>
          {title}
        </Typography>
        {action && <div style={styles.actionButton}>{action}</div>}
      </Toolbar>
    </AppBar>
  );
};

export default React.memo(DialogAppBar);
