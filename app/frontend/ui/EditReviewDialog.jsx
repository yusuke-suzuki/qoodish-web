import React, { Component } from 'react';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle,
} from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import PlaceIcon from 'material-ui-icons/Place';
import PhotoCameraIcon from 'material-ui-icons/PhotoCamera';
import CancelIcon from 'material-ui-icons/Cancel';
import Button from 'material-ui/Button';

const styles = {
  imagePreviewContainer: {
    position: 'relative'
  },
  imagePreview: {
    width: '100%'
  },
  clearImageIcon: {
    position: 'absolute',
    right: 0,
  },
  imageInput: {
    display: 'none'
  }
}

class EditReviewDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      comment: '',
      placeId: '',
      placeName: '',
      image: null,
      imagePreviewUrl: '',
      errorComment: '',
      disabled: true,
      imageDeleteRequest: false
    };
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
      this.setState({
        id: currentReview.id,
        comment: currentReview.comment,
        placeId: currentReview.place_id,
        placeName: currentReview.spot.name,
        imagePreviewUrl: imagePreviewUrl,
        disabled: false
      }, () => {
        this.drawImagePreview(imagePreviewUrl);
      });
    } else {
      this.clearInputs();
      this.setState({
        placeId: nextProps.selectedPlace.placeId,
        placeName: nextProps.selectedPlace.description
      });
    }
  }

  handleCommentChange(e) {
    let comment = e.target.value;
    let errorText;
    let disabled;
    if (comment) {
      if (comment.length > 140) {
        errorText = 'The maximum number of characters is 140';
        disabled = true;
      } else {
        errorText = '';
        disabled = false;
      }
    } else {
      errorText = 'Comment is required';
      disabled = true;
    }

    this.setState({
      comment: comment,
      errorComment: errorText,
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
      this.props.handleClickEditButton(this.props.currentReview, params, canvas, this.state.imageDeleteRequest);
    } else {
      this.props.handleClickCreateButton(this.props.mapId, params, canvas);
    }
  }

  imageNotChanged() {
    return this.props.currentReview && this.props.currentReview.image && this.state.imagePreviewUrl == this.props.currentReview.image.url;
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
    }

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
        onRequestClose={this.handleRequestClose}
        ignoreBackdropClick
        ignoreEscapeKeyUp
        fullWidth
      >
      　<DialogTitle>
          {this.props.currentReview ? 'Edit Report' : 'Create New Report'}
        </DialogTitle>
        <DialogContent>
          <Chip
            avatar={<Avatar><PlaceIcon /></Avatar>}
            label={this.state.placeName}
          />
          <br/>
          {this.renderCommentBox()}
          <br/>
          <br/>
          {this.state.imagePreviewUrl ? this.renderImagePreview() : null}
          <IconButton onClick={this.handleAddImageClick}>
            <PhotoCameraIcon />
          </IconButton>
          <input
            type='file'
            accept='image/*'
            id='review-image-input'
            onChange={this.handleImageChange}
            style={styles.imageInput}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleRequestClose}>
            Cancel
          </Button>
          <Button raised onClick={this.handleSaveButtonClick} color='primary' disabled={this.state.disabled}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderCommentBox() {
    return (
      <TextField
        label='Comment'
        onChange={this.handleCommentChange}
        error={this.state.errorComment ? true : false}
        helperText={this.state.errorComment}
        fullWidth
        value={this.state.comment}
        multiline
        autoFocus
        rowsMax='5'
        rows='5'
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
        <canvas id='canvas' style={styles.imagePreview}></canvas>
      </div>
    );
  }
}

export default EditReviewDialog;
