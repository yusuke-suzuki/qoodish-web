import React, { useCallback, useState } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import closeImageDialog from '../../actions/closeImageDialog';
import { useTheme } from '@material-ui/core';

const styles = {
  imageSmall: {
    width: '100%'
  },
  imageLarge: {
    width: '100%'
  },
  iconButton: {
    position: 'fixed',
    left: 0,
    top: 0,
    color: '#fff'
  },
  container: {
    marginBottom: -6,
    overflow: 'hidden'
  },
  paperSmall: {
    width: '100%',
    margin: 0
  }
};

const ImageDialog = () => {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const dispatch = useDispatch();
  const [currentImageUrl, setCurrentImageUrl] = useState(undefined);

  const mapState = useCallback(
    state => ({
      dialogOpen: state.shared.imageDialogOpen,
      imageUrl: state.shared.currentImageUrl
    }),
    []
  );

  const { dialogOpen, imageUrl } = useMappedState(mapState);

  const handleDialogClose = useCallback(() => {
    dispatch(closeImageDialog());
  }, [dispatch]);

  const handleOnEnter = useCallback(() => {
    if (imageUrl) {
      setCurrentImageUrl(imageUrl);
    }
  }, [imageUrl]);

  const handleOnExited = useCallback(() => {
    setCurrentImageUrl(undefined);
  }, []);

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleDialogClose}
      onEnter={handleOnEnter}
      onExited={handleOnExited}
      fullWidth
      scroll={smUp ? 'body' : 'paper'}
      disableScrollLock
      disableRestoreFocus={smUp ? true : false}
      maxWidth="md"
      PaperProps={{
        style: smUp ? {} : styles.paperSmall,
        square: true
      }}
    >
      <IconButton
        onClick={handleDialogClose}
        aria-label="close"
        style={styles.iconButton}
      >
        <CloseIcon fontSize="large" />
      </IconButton>
      {currentImageUrl && (
        <div style={styles.container}>
          <img
            src={currentImageUrl}
            style={smUp ? styles.imageLarge : styles.imageSmall}
            loading="lazy"
          />
        </div>
      )}
    </Dialog>
  );
};

export default React.memo(ImageDialog);
