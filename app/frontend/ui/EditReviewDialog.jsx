import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import PlaceIcon from '@material-ui/icons/Place';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import CancelIcon from '@material-ui/icons/Cancel';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import ListItemText from '@material-ui/core/ListItemText';
import Slide from '@material-ui/core/Slide';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import { sleep } from '../containers/Utils';
import I18n from '../containers/I18n';

const styles = {
  appbar: {
    position: 'relative'
  },
  flex: {
    flex: 1
  },
  dialogContentLarge: {},
  dialogContentSmall: {
    paddingTop: 24
  },
  toolbar: {
    paddingLeft: 8,
    height: 56
  },
  imagePreviewContainer: {
    position: 'relative'
  },
  imagePreview: {
    width: '100%'
  },
  clearImageIcon: {
    position: 'absolute',
    right: 0
  },
  imageInput: {
    display: 'none'
  }
};

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class EditReviewDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      mapId: undefined,
      comment: '',
      placeId: '',
      placeName: '',
      image: null,
      imagePreviewUrl: '',
      errorComment: '',
      disabled: true,
      imageDeleteRequest: false
    };
    this.handleMapChange = this.handleMapChange.bind(this);
    this.handleCommentChange = this.handleCommentChange.bind(this);
    this.handleSaveButtonClick = this.handleSaveButtonClick.bind(this);
    this.handleImageChange = this.handleImageChange.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
    this.handleClearImageClick = this.handleClearImageClick.bind(this);
    this.clearInputs = this.clearInputs.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.dialogOpen) {
      return;
    }
    let currentReview = nextProps.currentReview;
    if (currentReview) {
      let imagePreviewUrl = '';
      if (currentReview.image) {
        imagePreviewUrl = currentReview.image.url;
      }
      this.setState(
        {
          id: currentReview.id,
          mapId: currentReview.map_id,
          comment: currentReview.comment,
          placeId: currentReview.place_id,
          placeName: currentReview.spot.name,
          imagePreviewUrl: imagePreviewUrl,
          disabled: false
        },
        async () => {
          await sleep(1000);
          this.drawImagePreview(imagePreviewUrl);
        }
      );
    } else {
      this.clearInputs();
      if (nextProps.currentMap) {
        this.setState({
          mapId: nextProps.currentMap.id
        });
      } else if (nextProps.postableMaps.length > 0) {
        this.setState({
          mapId: nextProps.postableMaps[0].id
        });
      }
    }

    if (nextProps.selectedPlace) {
      this.setState({
        placeId: nextProps.selectedPlace.placeId,
        placeName: nextProps.selectedPlace.description
      });
    }
  }

  handleMapChange(e) {
    let mapId = e.target.value;
    this.setState(
      {
        mapId: mapId
      },
      () => {
        this.validate();
      }
    );
  }

  handleCommentChange(e) {
    let comment = e.target.value;
    let errorText;
    if (comment) {
      if (comment.length > 200) {
        errorText = I18n.t('max characters 200');
      } else {
        errorText = '';
      }
    } else {
      errorText = I18n.t('comment is required');
    }

    this.setState(
      {
        comment: comment,
        errorComment: errorText
      },
      () => {
        this.validate();
      }
    );
  }

  validate() {
    let disabled;
    if (this.state.comment && !this.state.errorComment && this.state.mapId) {
      disabled = false;
    } else {
      disabled = true;
    }
    this.setState({
      disabled: disabled
    });
  }

  handleSaveButtonClick() {
    let params = {
      comment: this.state.comment,
      place_id: this.state.placeId
    };
    let canvas = document.getElementById('canvas');
    if (this.imageNotChanged()) {
      canvas = null;
    }
    if (this.props.currentReview) {
      params.review_id = this.state.id;
      this.props.handleClickEditButton(
        this.props.currentReview,
        params,
        canvas,
        this.state.imageDeleteRequest
      );
    } else {
      this.props.handleClickCreateButton(this.state.mapId, params, canvas);
    }
  }

  imageNotChanged() {
    return (
      this.props.currentReview &&
      this.props.currentReview.image &&
      this.state.imagePreviewUrl == this.props.currentReview.image.url
    );
  }

  handleAddImageClick(e) {
    document.getElementById('review-image-input').click();
  }

  handleImageChange(e) {
    // 一回リセットしないと canvas の CORS エラーになる
    this.handleClearImageClick();

    let reader = new FileReader();
    let file = e.target.files[0];
    if (!file.type.match(/image\/*/)) {
      return;
    }

    reader.onloadend = () => {
      let dataUrl = reader.result;
      this.setState({
        image: file,
        imagePreviewUrl: dataUrl,
        imageDeleteRequest: false
      });

      this.drawImagePreview(dataUrl);
    };

    reader.readAsDataURL(file);
  }

  drawImagePreview(imageUrl) {
    let canvas = document.getElementById('canvas');
    if (!canvas) {
      return;
    }
    if (canvas.getContext) {
      let context = canvas.getContext('2d');
      let image = new Image();
      image.src = imageUrl;
      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);
      };
    }
  }

  handleClearImageClick() {
    this.setState({
      image: null,
      imagePreviewUrl: '',
      imageDeleteRequest: true
    });
  }

  handleRequestClose() {
    this.props.handleRequestClose();
    this.clearInputs();
  }

  clearInputs() {
    this.setState({
      id: null,
      mapId: null,
      comment: '',
      placeId: '',
      placeName: '',
      image: null,
      imagePreviewUrl: '',
      errorComment: '',
      disabled: true
    });
  }

  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.handleRequestClose}
        disableBackdropClick
        disableEscapeKeyDown
        fullWidth
        fullScreen={!this.props.large}
        TransitionComponent={Transition}
      >
        {this.props.large ? this.renderDialogTitle() : this.renderAppBar()}
        <DialogContent
          style={
            this.props.large
              ? styles.dialogContentLarge
              : styles.dialogContentSmall
          }
        >
          <Chip
            avatar={
              <Avatar>
                <PlaceIcon />
              </Avatar>
            }
            label={this.state.placeName}
            onClick={this.props.handleSpotClick}
          />
          <br />
          <br />
          {this.renderMapSelect()}
          <br />
          {this.renderCommentBox()}
          <br />
          <br />
          {this.state.imagePreviewUrl ? this.renderImagePreview() : null}
          {this.props.large && this.renderAddImageButton()}
          <input
            type="file"
            accept="image/*"
            id="review-image-input"
            onChange={this.handleImageChange}
            style={styles.imageInput}
          />
        </DialogContent>
        {this.props.large
          ? this.renderActionsLarge()
          : this.renderActionsSmall()}
      </Dialog>
    );
  }

  renderDialogTitle() {
    return (
      <DialogTitle>
        {this.props.currentReview ? I18n.t('edit report') : I18n.t('create new report')}
      </DialogTitle>
    );
  }

  renderAppBar() {
    return (
      <AppBar style={styles.appbar} color="primary">
        <Toolbar style={styles.toolbar}>
          <IconButton
            color="inherit"
            onClick={this.handleRequestClose}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="title" color="inherit" style={styles.flex}>
            {this.props.currentReview ? I18n.t('edit report') : I18n.t('create new report')}
          </Typography>
          <Button
            variant="raised"
            onClick={this.handleSaveButtonClick}
            color="secondary"
            disabled={this.state.disabled}
          >
            {I18n.t('save')}
          </Button>
        </Toolbar>
      </AppBar>
    );
  }

  renderActionsLarge() {
    return (
      <DialogActions>
        <Button onClick={this.handleRequestClose}>{I18n.t('cancel')}</Button>
        <Button
          variant="raised"
          onClick={this.handleSaveButtonClick}
          color="primary"
          disabled={this.state.disabled}
        >
          {I18n.t('save')}
        </Button>
      </DialogActions>
    );
  }

  renderActionsSmall() {
    return <DialogActions>{this.renderAddImageButton()}</DialogActions>;
  }

  renderAddImageButton() {
    return (
      <IconButton onClick={this.handleAddImageClick}>
        <PhotoCameraIcon />
      </IconButton>
    );
  }

  renderMapSelect() {
    return (
      <FormControl
        fullWidth
        error={this.state.mapId ? false : true}
        disabled={this.props.currentReview ? true : false}
      >
        <InputLabel htmlFor="map-input">{I18n.t('map')}</InputLabel>
        <Select
          value={this.state.mapId ? this.state.mapId : ''}
          onChange={this.handleMapChange}
          input={<Input id="map-input" style={{ padding: 20 }} />}
          renderValue={value =>
            this.renderSelectValue(value, this.props.postableMaps)
          }
          style={{ height: 'auto' }}
        >
          {this.renderPostableMaps()}
        </Select>
        <FormHelperText>
          {!this.state.mapId && I18n.t('map is required')}
        </FormHelperText>
      </FormControl>
    );
  }

  renderSelectValue(mapId, maps) {
    let map = maps.find(map => {
      return map.id == mapId;
    });
    return map ? map.name : '';
  }

  renderPostableMaps() {
    return this.props.postableMaps.map(map => (
      <MenuItem key={map.id} value={map.id}>
        <Avatar src={map.thumbnail_url} />
        <ListItemText primary={map.name} />
      </MenuItem>
    ));
  }

  renderCommentBox() {
    return (
      <TextField
        label={I18n.t('comment')}
        onChange={this.handleCommentChange}
        error={this.state.errorComment ? true : false}
        helperText={this.state.errorComment}
        fullWidth
        value={this.state.comment}
        multiline
        autoFocus
        rowsMax="5"
        rows="5"
      />
    );
  }

  renderImagePreview() {
    return (
      <div style={styles.imagePreviewContainer}>
        <IconButton
          style={styles.clearImageIcon}
          onClick={this.handleClearImageClick}
        >
          <CancelIcon />
        </IconButton>
        <canvas id="canvas" style={styles.imagePreview} />
      </div>
    );
  }
}

export default EditReviewDialog;
