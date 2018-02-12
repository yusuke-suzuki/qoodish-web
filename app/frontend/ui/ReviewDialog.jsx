import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import Card, { CardHeader, CardMedia, CardContent, CardActions } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import Avatar from 'material-ui/Avatar';
import moment from 'moment';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import Menu, { MenuItem } from 'material-ui/Menu';
import MoreVertIcon from 'material-ui-icons/MoreVert';
import ShareIcon from 'material-ui-icons/Share';
import CopyToClipboard from 'react-copy-to-clipboard';
import Slide from 'material-ui/transitions/Slide';
import FavoriteIcon from 'material-ui-icons/Favorite';
import FavoriteBorderIcon from 'material-ui-icons/FavoriteBorder';
import ArrowBackIcon from 'material-ui-icons/ArrowBack';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';

const styles = {
  appbar: {
    position: 'sticky'
  },
  profileImage: {
    width: 40
  },
  cardLarge: {
    minHeight: '100%'
  },
  cardSmall: {
    minHeight: '100%'
  },
  cardContent: {
    paddingTop: 0
  },
  cardMedia: {
    marginBottom: -5
  },
  media: {
    width: '100%'
  },
  closeButtonContainer: {
    flex: '1 1 auto'
  },
  closeButton: {
    float: 'right'
  },
  reviewAction: {
    minWidth: 'auto'
  },
  likesCount: {
    cursor: 'pointer',
    width: 'fit-content'
  },
  likesCountLarge: {
    paddingBottom: 8
  },
  likesCountSmall: {
    paddingBottom: 16
  },
  backIcon: {
    color: 'white'
  }
};

function Transition(props) {
  return <Slide direction='up' {...props} />;
}

class ReviewDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorElShare: undefined,
      shareMenuOpen: false,
      anchorElVert: undefined,
      vertMenuOpen: false
    };
    this.handleShareButtonClick = this.handleShareButtonClick.bind(this);
    this.handleVertButtonClick = this.handleVertButtonClick.bind(this);
    this.handleRequestShareMenuClose = this.handleRequestShareMenuClose.bind(this);
    this.handleRequestVertMenuClose = this.handleRequestVertMenuClose.bind(this);
  }

  handleShareButtonClick(event) {
    this.setState({
      shareMenuOpen: true,
      anchorElShare: event.currentTarget
    });
  }

  handleVertButtonClick(event) {
    this.setState({
      vertMenuOpen: true,
      anchorElVert: event.currentTarget
    });
  }

  handleRequestShareMenuClose() {
    this.setState({
      shareMenuOpen: false
    });
  }

  handleRequestVertMenuClose() {
    this.setState({
      vertMenuOpen: false
    });
  }

  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.props.handleRequestDialogClose}
        transition={Transition}
        fullWidth
        fullScreen={this.props.large ? false : true}
      >
        {this.props.large ? null : this.renderAppBar()}
        {this.renderReviewCard(this.props.currentReview)}
      </Dialog>
    );
  }

  renderAppBar() {
    return (
      <AppBar style={styles.appbar}>
        <Toolbar disableGutters>
          <IconButton onClick={this.props.handleRequestDialogClose}>
            <ArrowBackIcon style={styles.backIcon} />
          </IconButton>
          <Typography
            type='headline'
            color='inherit'
          >
            Report
          </Typography>
        </Toolbar>
      </AppBar>
    )
  }

  renderLikes(review) {
    return (
      <CardContent style={this.props.large ? styles.likesCountLarge : styles.likesCountSmall}>
        <Typography onClick={() => this.props.handleLikesClick(review)} style={styles.likesCount}>
          <b>{review.likes_count}</b> likes
        </Typography>
      </CardContent>
    );
  }

  renderLikeButton(review) {
    return (
      <IconButton
        onClick={() => review.liked ? this.props.handleUnlikeButtonClick(review) : this.props.handleLikeButtonClick(review)}
        style={styles.reviewAction}
      >
        {review.liked ? <FavoriteIcon color='error' /> : <FavoriteBorderIcon />}
      </IconButton>
    );
  }

  renderShareButton() {
    return (
      <IconButton
        aria-label='More share'
        aria-owns={this.state.shareMenuOpen ? 'share-menu' : null}
        aria-haspopup='true'
        onClick={this.handleShareButtonClick}
        style={styles.reviewAction}
      >
        <ShareIcon />
      </IconButton>
    );
  }

  renderShareMenu() {
    return (
      <Menu
        id='share-menu'
        anchorEl={this.state.anchorElShare}
        open={this.state.shareMenuOpen}
        onClose={this.handleRequestShareMenuClose}
      >
        <MenuItem
          key='facebook'
          onClick={() => {
            this.handleRequestShareMenuClose();
            this.props.handleFacebookButtonClick(this.props.currentReview);;
          }}
        >
          Share with Facebook
        </MenuItem>
        <MenuItem
          key='twitter'
          onClick={() => {
            this.handleRequestShareMenuClose();
            this.props.handleTweetButtonClick(this.props.currentReview)
          }}
        >
          Share with Twitter
        </MenuItem>
        <CopyToClipboard
          text={`${process.env.ENDPOINT}/maps/${this.props.currentReview.map_id}/reports/${this.props.currentReview.id}`}
          onCopy={this.props.handleUrlCopied}
          key='copy'
        >
          <MenuItem key='copy' onClick={this.handleRequestShareMenuClose}>
            Copy link
          </MenuItem>
        </CopyToClipboard>
      </Menu>
    );
  }

  renderMoreVertButton() {
    return (
      <IconButton
        aria-label='More vert'
        aria-owns={this.state.vertMenuOpen ? 'vert-menu' : null}
        aria-haspopup='true'
        onClick={this.handleVertButtonClick}
      >
        <MoreVertIcon />
      </IconButton>
    );
  }

  renderMoreVertMenu() {
    return (
      <div>{this.props.currentReview.editable ? this.renderMenuForOwner() : this.renderMenuForMember()}</div>
    );
  }

  renderMenuForOwner() {
    return (
      <Menu
        id='vert-menu'
        anchorEl={this.state.anchorElVert}
        open={this.state.vertMenuOpen}
        onClose={this.handleRequestVertMenuClose}
      >
        {this.renderEditButton()}
        {this.renderDeleteButton()}
      </Menu>
    );
  }

  renderMenuForMember() {
    return (
      <Menu
        id='vert-menu'
        anchorEl={this.state.anchorElVert}
        open={this.state.vertMenuOpen}
        onClose={this.handleRequestVertMenuClose}
      >
        <MenuItem
          key='issue'
          onClick={() => {
            this.handleRequestVertMenuClose();
            this.props.handleIssueButtonClick(this.props.currentReview);
          }}
        >
          Issue
        </MenuItem>
      </Menu>
    );
  }

  renderEditButton() {
    return (
      <MenuItem
        key='edit'
        onClick={() => {
          this.handleRequestVertMenuClose();
          this.props.handleEditReviewButtonClick(this.props.currentReview);
        }}
      >
        Edit
      </MenuItem>
    );
  }

  renderDeleteButton() {
    return (
      <MenuItem
        key='delete'
        onClick={() => {
          this.handleRequestVertMenuClose();
          this.props.handleDeleteReviewButtonClick(this.props.currentReview);
        }}
      >
        Delete
      </MenuItem>
    );
  }

  renderReviewCard(review) {
    return (
      <Card style={this.props.large ? styles.cardLarge : styles.cardSmall}>
        {review && this.renderMoreVertMenu()}
        <CardHeader
          avatar={
            <Avatar>
              <img src={review && review.author.profile_image_url} alt={review && review.author.name} style={styles.profileImage} />
            </Avatar>
          }
          action={this.renderMoreVertButton()}
          title={review && review.author.name}
          subheader={review && moment(review.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ').locale(window.currentLocale).format('LL')}
        />
        <CardContent style={styles.cardContent}>
          <Typography type='headline' component='h2' gutterBottom>
            {review && review.spot.name}
          </Typography>
          <Typography component='p'>
            {review && review.comment}
          </Typography>
        </CardContent>
        {review && review.image ? this.renderCardMedia(review) : null}
        {review && review.likes_count > 0 && this.renderLikes(review)}
        <CardActions disableActionSpacing>
          {review && this.renderLikeButton(review)}
          {this.renderShareButton()}
          {review && this.renderShareMenu()}
          {this.props.large ? this.renderCloseButton() : null}
        </CardActions>
      </Card>
    );
  }

  renderCloseButton() {
    return (
      <div style={styles.closeButtonContainer}>
        <Button onClick={this.props.handleRequestDialogClose} style={styles.closeButton}>
          Close
        </Button>
      </div>
    );
  }

  renderCardMedia(review) {
    return (
      <CardMedia style={styles.cardMedia}>
        <img src={review.image.url} style={styles.media} />
      </CardMedia>
    );
  }
}

export default ReviewDialog;
