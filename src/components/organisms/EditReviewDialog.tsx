import React, { useCallback, useState, useEffect } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import PlaceIcon from '@material-ui/icons/Place';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';
import Fade from '@material-ui/core/Fade';

import * as loadImage from 'blueimp-load-image';

import closeEditReviewDialog from '../../actions/closeEditReviewDialog';
import openToast from '../../actions/openToast';
import openPlaceSelectDialog from '../../actions/openPlaceSelectDialog';
import fetchPostableMaps from '../../actions/fetchPostableMaps';
import I18n from '../../utils/I18n';

import { MapsApi } from '@yusuke-suzuki/qoodish-api-js-client';

import DialogAppBar from '../molecules/DialogAppBar';
import MapSelect from '../molecules/MapSelect';
import ReviewCommentForm from '../molecules/ReviewCommentForm';
import SaveReviewButton from '../molecules/SaveReviewButton';
import ReviewImagePreview from '../molecules/ReviewImagePreview';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

import { v1 as uuidv1 } from 'uuid';

const styles = {
  dialogContentLarge: {},
  dialogContentSmall: {
    paddingTop: 24
  },
  imageInput: {
    display: 'none'
  },
  placeChipLabel: {
    overflow: 'hidden',
    maxWidth: 'calc(100vw - 100px)',
    textOverflow: 'ellipsis'
  },
  gridList: {
    flexWrap: 'nowrap',
    transform: 'translateZ(0)',
    width: '100%'
  }
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AddImageButton = React.memo(props => {
  const { images } = props;

  const handleAddImageClick = useCallback(() => {
    document.getElementById('review-image-input').click();
  }, []);

  return (
    <IconButton onClick={handleAddImageClick} disabled={4 <= images.length}>
      <AddAPhotoIcon />
    </IconButton>
  );
});

const EditReviewDialog = () => {
  const large = useMediaQuery('(min-width: 600px)');

  const [targetMapId, setTargetMapId] = useState(undefined);
  const [comment, setComment] = useState('');
  const [errorComment, setErrorComment] = useState(undefined);
  const [disabled, setDisabled] = useState(true);
  const [images, setImages] = useState([]);
  const [currentFiles, setCurrentFiles] = useState([]);

  useEffect(() => {
    if (targetMapId && comment && !errorComment && images.length <= 4) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [targetMapId, comment, errorComment, images]);

  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      dialogOpen: state.reviews.editReviewDialogOpen,
      selectedPlace: state.reviews.selectedPlace,
      currentReview: state.reviews.targetReview
    }),
    []
  );

  const { dialogOpen, selectedPlace, currentReview } = useMappedState(mapState);

  const handleMapChange = useCallback(currentMapId => {
    setTargetMapId(currentMapId);
  }, []);

  const handleCommentChange = useCallback(
    (currentComment, currentCommentError) => {
      setErrorComment(currentCommentError);
      setComment(currentComment);
    },
    []
  );

  const setCurrentReview = useCallback(() => {
    if (currentReview) {
      setImages(
        currentReview.images.map(image => {
          const element = new Image();
          element.src = image.thumbnail_url_400;
          element.dataset.url = image.url;
          element.id = uuidv1();
          return element;
        })
      );
      setDisabled(false);
    }
  }, [currentReview]);

  const handleRequestClose = useCallback(() => {
    dispatch(closeEditReviewDialog());
  }, []);

  const handleSpotClick = useCallback(() => {
    dispatch(openPlaceSelectDialog());
  }, [dispatch]);

  const initForm = useCallback(() => {
    setCurrentReview();
    initPostableMaps();
  }, []);

  const initPostableMaps = useCallback(async () => {
    const apiInstance = new MapsApi();
    const opts = {
      postable: true
    };

    apiInstance.mapsGet(opts, (error, data, response) => {
      if (response.ok) {
        dispatch(fetchPostableMaps(response.body));
      } else if (response.status == 401) {
        dispatch(openToast('Authenticate failed'));
      } else {
        console.log(error);
      }
    });
  }, [dispatch]);

  const handleImageFilesChange = useCallback(
    e => {
      const files = e.target.files;

      for (let file of files) {
        if (currentFiles.some(currentFile => currentFile.name === file.name)) {
          continue;
        }
        currentFiles.push(file);
      }

      setCurrentFiles([...currentFiles]);
    },
    [currentFiles]
  );

  const fileToCanvas = useCallback(
    async file => {
      if (!file.type.match(/image\/*/)) {
        return;
      }

      const image = new Image();

      loadImage.parseMetaData(file, data => {
        const options = {
          canvas: true
        };

        if (data.exif) {
          Object.assign(options, {
            orientation: data.exif.get('Orientation')
          });
        }

        loadImage(
          file,
          canvas => {
            image.src = canvas.toDataURL('image/jpeg');
            image.id = uuidv1();

            images.push(image);
            setImages([...images]);
          },
          options
        );
      });
    },
    [images]
  );

  useEffect(() => {
    for (let file of currentFiles) {
      fileToCanvas(file);
    }
  }, [currentFiles]);

  const clearInputs = useCallback(() => {
    setDisabled(true);
    setImages([]);
    setCurrentFiles([]);
  }, []);

  const handleImageRemoved = useCallback(
    targetImage => {
      setImages(
        images.filter(image => {
          return image.id !== targetImage.id;
        })
      );
    },
    [images]
  );

  return (
    <Dialog
      open={dialogOpen}
      onEnter={initForm}
      onClose={handleRequestClose}
      onExited={clearInputs}
      disableBackdropClick
      disableEscapeKeyDown
      fullWidth
      fullScreen={!large}
      TransitionComponent={large ? Fade : Transition}
    >
      {large ? (
        <DialogTitle>
          {currentReview ? I18n.t('edit report') : I18n.t('create new report')}
        </DialogTitle>
      ) : (
        <DialogAppBar
          title={
            currentReview ? I18n.t('edit report') : I18n.t('create new report')
          }
          action={
            <SaveReviewButton
              color="secondary"
              disabled={disabled}
              selectedPlace={selectedPlace}
              images={images}
              comment={comment}
              currentReview={currentReview}
              targetMapId={targetMapId}
            />
          }
          handleRequestDialogClose={handleRequestClose}
        />
      )}

      <DialogContent
        style={large ? styles.dialogContentLarge : styles.dialogContentSmall}
      >
        <Chip
          avatar={
            <Avatar>
              <PlaceIcon />
            </Avatar>
          }
          label={
            <div style={styles.placeChipLabel}>
              {selectedPlace && selectedPlace.description}
            </div>
          }
          onClick={handleSpotClick}
          clickable
        />

        <MapSelect
          currentReview={currentReview}
          onMapChange={handleMapChange}
        />

        <ReviewCommentForm
          currentReview={currentReview}
          onCommentChange={handleCommentChange}
        />

        <GridList
          cols={2.5}
          style={styles.gridList}
          spacing={4}
          cellHeight={150}
        >
          {images.map(image => (
            <GridListTile key={image.id}>
              <ReviewImagePreview
                id={image.id}
                image={image}
                onImageRemoved={() => handleImageRemoved(image)}
              />
            </GridListTile>
          ))}
        </GridList>

        {large && <AddImageButton images={images} />}

        <input
          type="file"
          accept="image/*"
          id="review-image-input"
          onChange={handleImageFilesChange}
          style={styles.imageInput}
          multiple
        />
      </DialogContent>

      {large ? (
        <DialogActions>
          <Button onClick={handleRequestClose}>{I18n.t('cancel')}</Button>
          <SaveReviewButton
            color="primary"
            disabled={disabled}
            selectedPlace={selectedPlace}
            images={images}
            comment={comment}
            currentReview={currentReview}
            targetMapId={targetMapId}
          />
        </DialogActions>
      ) : (
        <DialogActions>
          <AddImageButton images={images} />
        </DialogActions>
      )}
    </Dialog>
  );
};

export default React.memo(EditReviewDialog);
