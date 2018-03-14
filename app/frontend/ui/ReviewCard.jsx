import React, { Component } from 'react';
import Card, {
  CardHeader,
  CardMedia,
  CardContent,
  CardActions
} from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import Avatar from 'material-ui/Avatar';
import moment from 'moment';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import Menu, { MenuItem } from 'material-ui/Menu';
import MoreVertIcon from 'material-ui-icons/MoreVert';
import ShareIcon from 'material-ui-icons/Share';
import CopyToClipboard from 'react-copy-to-clipboard';
import FavoriteIcon from 'material-ui-icons/Favorite';
import FavoriteBorderIcon from 'material-ui-icons/FavoriteBorder';
import Badge from 'material-ui/Badge';
import twitter from 'twitter-text';

const styles = {
  card: {},
  cardDetail: {
    minHeight: 'calc(100vh - 56px)'
  },
  cardTitle: {
    cursor: 'pointer',
    width: 'fit-content',
    wordBreak: 'break-all'
  },
  reviewComment: {
    wordBreak: 'break-all'
  },
  profileImage: {
    width: 40
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
  dialogActions: {
    margin: '4px 4px',
    justifyContent: 'flex-start'
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    bottom: 9
  },
  likesCount: {
    cursor: 'pointer',
    marginLeft: 5
  },
  shareButton: {
    marginLeft: 'auto'
  }
};

class ReviewCard extends Component {
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
    this.handleRequestShareMenuClose = this.handleRequestShareMenuClose.bind(
      this
    );
    this.handleRequestVertMenuClose = this.handleRequestVertMenuClose.bind(
      this
    );
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
    return <div>{this.renderReviewCard(this.props.currentReview)}</div>;
  }

  renderReviewCard(review) {
    const commentHtml = {
      __html: twitter.autoLink(
        twitter.htmlEscape(review.comment),
        { targetBlank: true }
      )
    };

    return (
      <Card style={this.props.detail ? styles.cardDetail : styles.card}>
        {review.editable
          ? this.renderMoreVertMenuForEdit()
          : this.renderMoreVertMenu()}
        <CardHeader
          avatar={
            <Avatar>
              <img
                src={review.author.profile_image_url}
                alt={review.author.name}
                style={styles.profileImage}
              />
            </Avatar>
          }
          action={[this.renderShareButton(), this.renderMoreVertButton()]}
          title={review.author.name}
          subheader={this.renderCreatedAt(review)}
        />
        <CardContent style={styles.cardContent}>
          <Typography
            style={styles.cardTitle}
            type="subheading"
            color="primary"
            gutterBottom
            onClick={this.props.handleMapClick}
          >
            {review.map_name}
          </Typography>
          <Typography
            style={styles.cardTitle}
            type="headline"
            component="h2"
            gutterBottom
            onClick={() => this.props.handleSpotNameClick(review.spot)}
          >
            {review.spot.name}
          </Typography>
          <Typography component="p" dangerouslySetInnerHTML={commentHtml} style={styles.reviewComment}>
          </Typography>
        </CardContent>
        {review.image ? this.renderCardMedia(review) : null}
        <CardActions disableActionSpacing>
          {this.renderLikeButton(review)}
          {review.likes_count > 0 && this.renderLikes(review)}
          {this.renderShareMenu()}
        </CardActions>
      </Card>
    );
  }

  renderLikes(review) {
    return (
      <Badge
        badgeContent={review.likes_count}
        color="default"
        onClick={this.props.handleLikesClick}
        style={styles.likesCount}
      >
        <div />
      </Badge>
    );
  }

  renderCreatedAt(review) {
    return moment(review.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ')
      .locale(window.currentLocale)
      .format('LL');
  }

  renderCardMedia(review) {
    return (
      <CardMedia style={styles.cardMedia}>
        <img src={review.image.url} style={styles.media} />
      </CardMedia>
    );
  }

  renderLikeButton(review) {
    return (
      <IconButton
        onClick={
          review.liked
            ? this.props.handleUnlikeButtonClick
            : this.props.handleLikeButtonClick
        }
      >
        {review.liked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
      </IconButton>
    );
  }

  renderShareButton() {
    return (
      <IconButton
        aria-label="More share"
        aria-owns={this.state.shareMenuOpen ? 'share-menu' : null}
        aria-haspopup="true"
        onClick={this.handleShareButtonClick}
        style={styles.shareButton}
        key="share"
      >
        <ShareIcon />
      </IconButton>
    );
  }

  renderShareMenu() {
    return (
      <Menu
        id="share-menu"
        anchorEl={this.state.anchorElShare}
        open={this.state.shareMenuOpen}
        onClose={this.handleRequestShareMenuClose}
      >
        <MenuItem
          key="facebook"
          onClick={() => {
            this.handleRequestShareMenuClose();
            this.props.handleFacebookButtonClick(this.props.currentReview);
          }}
        >
          Share with Facebook
        </MenuItem>
        <MenuItem
          key="twitter"
          onClick={() => {
            this.handleRequestShareMenuClose();
            this.props.handleTweetButtonClick(this.props.currentReview);
          }}
        >
          Share with Twitter
        </MenuItem>
        <CopyToClipboard
          text={`${process.env.ENDPOINT}/maps/${
            this.props.currentReview.map_id
          }/reports/${this.props.currentReview.id}`}
          onCopy={this.props.handleUrlCopied}
          key="copy"
        >
          <MenuItem key="copy-link" onClick={this.handleRequestShareMenuClose}>
            Copy link
          </MenuItem>
        </CopyToClipboard>
      </Menu>
    );
  }

  renderMoreVertButton() {
    return (
      <IconButton
        aria-label="More vert"
        aria-owns={this.state.vertMenuOpen ? 'vert-menu' : null}
        aria-haspopup="true"
        onClick={this.handleVertButtonClick}
        key="more-vert"
      >
        <MoreVertIcon />
      </IconButton>
    );
  }

  renderMoreVertMenu() {
    return (
      <Menu
        id="vert-menu"
        anchorEl={this.state.anchorElVert}
        open={this.state.vertMenuOpen}
        onClose={this.handleRequestVertMenuClose}
      >
        {this.props.currentReview.editable ? this.renderEditButton() : null}
        {this.props.currentReview.editable ? this.renderDeleteButton() : null}
        <MenuItem
          key="issue"
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

  renderMoreVertMenu() {
    return (
      <Menu
        id="vert-menu"
        anchorEl={this.state.anchorElVert}
        open={this.state.vertMenuOpen}
        onClose={this.handleRequestVertMenuClose}
      >
        <MenuItem
          key="issue"
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

  renderMoreVertMenuForEdit() {
    return (
      <Menu
        id="vert-menu"
        anchorEl={this.state.anchorElVert}
        open={this.state.vertMenuOpen}
        onClose={this.handleRequestVertMenuClose}
      >
        {this.renderEditButton()}
        {this.renderCopyButton()}
        {this.renderDeleteButton()}
      </Menu>
    );
  }

  renderEditButton() {
    return (
      <MenuItem
        key="edit"
        onClick={() => {
          this.handleRequestVertMenuClose();
          this.props.handleEditReviewButtonClick(this.props.currentReview);
        }}
      >
        Edit
      </MenuItem>
    );
  }

  renderCopyButton() {
    return (
      <MenuItem
        key="copy-review"
        onClick={() => {
          this.handleRequestVertMenuClose();
          this.props.handleCopyReviewButtonClick(this.props.currentReview);
        }}
      >
        Copy
      </MenuItem>
    );
  }

  renderDeleteButton() {
    return (
      <MenuItem
        key="delete"
        onClick={() => {
          this.handleRequestVertMenuClose();
          this.props.handleDeleteReviewButtonClick(this.props.currentReview);
        }}
      >
        Delete
      </MenuItem>
    );
  }
}

export default ReviewCard;
