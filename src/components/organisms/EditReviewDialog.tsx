import {
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  Slide,
  SlideProps,
  Theme,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import uploadToStorage from '../../utils/uploadToStorage';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch, useMappedState } from 'redux-react-hook';
import closeEditReviewDialog from '../../actions/closeEditReviewDialog';
import { ReviewsApi, NewReview } from '@yusuke-suzuki/qoodish-api-js-client';
import openToast from '../../actions/openToast';
import I18n from '../../utils/I18n';
import DialogAppBar from '../molecules/DialogAppBar';
import PhotoTiles from '../molecules/PhotoTiles';
import AddPhotoButton from '../molecules/AddPhotoButton';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';
import sleep from '../../utils/sleep';
import createReview from '../../actions/createReview';
import selectMapSpot from '../../actions/selectMapSpot';
import editReview from '../../actions/editReview';
import ReviewCommentForm from '../molecules/ReviewCommentForm';
import PlaceAutocomplete from '../molecules/PlaceAutocomplete';
import PostableMapsAutocomplete from '../molecules/PostableMapsAutocomplete';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    addPhotoButton: {
      marginRight: 'auto'
    },
    placeChipLabel: {
      overflow: 'hidden',
      maxWidth: 'calc(100vw - 100px)',
      textOverflow: 'ellipsis'
    },
    photoTiles: {
      marginTop: theme.spacing(2)
    },
    dialogContent: {
      paddingTop: theme.spacing(3),
      [theme.breakpoints.up('sm')]: {
        paddingTop: 0
      }
    },
    dialogActions: {
      padding: theme.spacing(2)
    }
  })
);

const Transition = forwardRef(function Transition(props: SlideProps, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default memo(function EditReviewDialog() {
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      dialogOpen: state.reviews.editReviewDialogOpen,
      currentReview: state.reviews.targetReview,
      currentMap: state.mapDetail.currentMap
    }),
    []
  );

  const { dialogOpen, currentReview, currentMap } = useMappedState(mapState);

  const [comment, setComment] = useState<string>(null);
  const [targetMapId, setTargetMapId] = useState<number>(null);
  const [dataUrls, setDataUrls] = useState<string[]>([]);
  const [selectedSpot, setSelectedSpot] = useState(null);

  const disabled = useMemo(() => {
    return !(comment && targetMapId && selectedSpot);
  }, [comment, targetMapId && selectedSpot]);

  const classes = useStyles();
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const handleExited = useCallback(() => {
    setComment(null);
    setDataUrls([]);
    setTargetMapId(null);
  }, []);

  const handleRequestClose = useCallback(() => {
    dispatch(closeEditReviewDialog());
  }, [dispatch]);

  const handleImagesChange = useCallback(
    currentDataUrls => {
      setDataUrls([...dataUrls, ...currentDataUrls]);
    },
    [dataUrls]
  );

  const handleImageRemove = useCallback(
    index => {
      setDataUrls(
        dataUrls.filter((_dataUrl, i) => {
          return i !== index;
        })
      );
    },
    [dataUrls]
  );

  const handleCommentChange = useCallback(value => {
    setComment(value);
  }, []);

  const handleMapChange = useCallback(map => {
    setTargetMapId(map ? map.id : null);
  }, []);

  const handleSaveClick = useCallback(async () => {
    dispatch(requestStart());

    const photos = [];

    for (let dataUrl of dataUrls) {
      const url = new URL(dataUrl);

      if (url.protocol === 'data:') {
        const fileName = `images/${uuidv4()}.jpg`;
        const url = await uploadToStorage(dataUrl, fileName, 'data_url');

        photos.push({ url: url });
      } else {
        // Do nothing
        photos.push({ url: dataUrl });
      }
    }

    const review = NewReview.constructFromObject({
      comment: comment,
      place_id: selectedSpot.place_id,
      images: photos
    });

    if (currentReview) {
      handleEditReview(review);
    } else {
      handleCreateReview(review);
    }
  }, [
    dispatch,
    comment,
    dataUrls,
    uploadToStorage,
    currentReview,
    selectedSpot
  ]);

  const handleCreateReview = useCallback(
    review => {
      const apiInstance = new ReviewsApi();

      apiInstance.mapsMapIdReviewsPost(
        targetMapId,
        review,
        async (error, data, response) => {
          dispatch(requestFinish());

          if (response.ok) {
            dispatch(closeEditReviewDialog());
            dispatch(openToast(I18n.t('create review success')));

            // wait until thumbnail created on cloud function
            await sleep(3000);

            const newReview = response.body;
            dispatch(createReview(newReview));
            dispatch(selectMapSpot(newReview.spot));
          } else {
            dispatch(openToast(response.body.detail));
          }
        }
      );
    },
    [targetMapId, dispatch]
  );

  const handleEditReview = useCallback(
    review => {
      const apiInstance = new ReviewsApi();

      apiInstance.reviewsReviewIdPut(
        currentReview.id,
        review,
        async (error, data, response) => {
          dispatch(requestFinish());

          if (response.ok) {
            dispatch(closeEditReviewDialog());
            dispatch(openToast(I18n.t('edit review success')));

            // wait until thumbnail created on cloud function
            await sleep(3000);

            const newReview = response.body;
            dispatch(editReview(newReview));
          } else {
            dispatch(openToast(response.body.detail));
          }
        }
      );
    },
    [currentReview, dispatch]
  );

  const handlePlaceChange = useCallback(place => {
    if (place) {
      setSelectedSpot({
        place_id: place.place_id,
        description: place.description
      });
    } else {
      setSelectedSpot(null);
    }
  }, []);

  useEffect(() => {
    if (currentReview) {
      setTargetMapId(currentReview.map.id);
      setComment(currentReview.comment);
      setDataUrls(currentReview.images.map(image => image.url));
      setSelectedSpot(currentReview.spot);
    }

    return () => handleExited();
  }, [currentReview]);

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleRequestClose}
      onExited={handleExited}
      disableBackdropClick
      disableEscapeKeyDown
      fullWidth
      fullScreen={!smUp}
      TransitionComponent={Transition}
    >
      {smUp ? (
        <DialogTitle>
          {currentReview ? I18n.t('edit report') : I18n.t('create new report')}
        </DialogTitle>
      ) : (
        <DialogAppBar
          title={
            currentReview ? I18n.t('edit report') : I18n.t('create new report')
          }
          action={
            <Button
              variant="contained"
              onClick={handleSaveClick}
              color="secondary"
              disabled={disabled}
              data-test="save-review-button"
            >
              {I18n.t('save')}
            </Button>
          }
          handleRequestDialogClose={handleRequestClose}
        />
      )}

      <DialogContent className={classes.dialogContent}>
        <PlaceAutocomplete
          onChange={handlePlaceChange}
          label={I18n.t('search places')}
          defaultValue={currentReview ? currentReview.spot : null}
        />

        <PostableMapsAutocomplete
          onChange={handleMapChange}
          defaultValue={
            currentReview
              ? currentReview.map.id
              : currentMap
              ? currentMap.id
              : null
          }
        />

        <ReviewCommentForm
          currentReview={currentReview}
          onChange={handleCommentChange}
        />

        <div className={classes.photoTiles}>
          <PhotoTiles
            photoURLs={dataUrls}
            onRemove={handleImageRemove}
            variant="preview"
          />
        </div>
      </DialogContent>

      {smUp ? (
        <DialogActions className={classes.dialogActions}>
          <div className={classes.addPhotoButton}>
            <AddPhotoButton
              id="review-image-input"
              onChange={handleImagesChange}
              multiple
            />
          </div>

          <Button onClick={handleRequestClose}>{I18n.t('cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleSaveClick}
            color="primary"
            disabled={disabled}
            data-test="save-review-button"
          >
            {I18n.t('save')}
          </Button>
        </DialogActions>
      ) : (
        <DialogActions className={classes.dialogActions}>
          <AddPhotoButton
            id="review-image-input"
            onChange={handleImagesChange}
            multiple
          />
        </DialogActions>
      )}
    </Dialog>
  );
});
