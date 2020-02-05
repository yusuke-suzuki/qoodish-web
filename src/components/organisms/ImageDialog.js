import React, { useCallback, useState } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import closeImageDialog from '../../actions/closeImageDialog';

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
  const large = useMediaQuery('(min-width: 600px)');
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
  });

  const handleOnEnter = useCallback(() => {
    if (imageUrl) {
      setCurrentImageUrl(imageUrl);
    }
  });

  const handleOnExited = useCallback(() => {
    setCurrentImageUrl(undefined);
  });

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleDialogClose}
      onEnter={handleOnEnter}
      onExited={handleOnExited}
      fullWidth
      scroll={large ? 'body' : 'paper'}
      disableRestoreFocus={large ? true : false}
      maxWidth="md"
      PaperProps={{
        style: large ? {} : styles.paperSmall,
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
            style={large ? styles.imageLarge : styles.imageSmall}
            loading="lazy"
          />
        </div>
      )}
    </Dialog>
  );
};

export default React.memo(ImageDialog);
