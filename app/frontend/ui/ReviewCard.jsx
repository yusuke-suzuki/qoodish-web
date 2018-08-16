import React from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import moment from 'moment';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ShareIcon from '@material-ui/icons/Share';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import Badge from '@material-ui/core/Badge';
import ButtonBase from '@material-ui/core/ButtonBase';
import twitter from 'twitter-text';
import CopyToClipboard from 'react-copy-to-clipboard';
import I18n from '../containers/I18n';
import { Link } from 'react-router-dom';

const styles = {
  card: {},
  cardDetail: {
    minHeight: 'calc(100vh - 56px)'
  },
  cardTitle: {
    width: 'fit-content',
    wordBreak: 'break-all'
  },
  reviewComment: {
    wordBreak: 'break-all'
  },
  cardContent: {
    paddingTop: 0
  },
  cardMedia: {
    marginBottom: -5
  },
  reviewImage: {
    width: '100%'
  },
  dialogActions: {
    margin: '4px 4px',
    justifyContent: 'flex-start'
  },
  likesCount: {
    cursor: 'pointer',
    marginLeft: 5
  },
  shareButton: {
    marginLeft: 'auto'
  }
};

class ReviewCard extends React.Component {
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
            <ButtonBase
              component={Link}
              to={`/users/${review.author.id}`}
            >
              <Avatar
                src={review.author.profile_image_url}
              />
            </ButtonBase>
          }
          action={[this.renderShareButton(), this.renderMoreVertButton()]}
          title={review.author.name}
          subheader={this.renderCreatedAt(review)}
        />
        <CardContent style={styles.cardContent}>
          <ButtonBase
            component={Link}
            to={`/maps/${review.map_id}`}
          >
            <Typography
              variant="subheading"
              color="primary"
              style={styles.cardTitle}
              gutterBottom
            >
              {review.map_name}
            </Typography>
          </ButtonBase>
          <br/>
          <ButtonBase
            component={Link}
            to={`/spots/${review.spot.place_id}`}
          >
            <Typography
              variant="headline"
              component="h2"
              style={styles.cardTitle}
              gutterBottom
            >
              {review.spot.name}
            </Typography>
          </ButtonBase>
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
      <CardMedia
        style={styles.cardMedia}
      >
        <img src={review.image.url} style={styles.reviewImage} alt={review.spot.name} />
      </CardMedia>
    );
  }

  renderLikeButton(review) {
    return (
      <IconButton
        onClick={() => {
          review.liked
            ? this.props.handleUnlikeButtonClick()
            : this.props.handleLikeButtonClick(this.props.currentUser)
        }}
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
          {I18n.t('share with facebook')}
        </MenuItem>
        <MenuItem
          key="twitter"
          onClick={() => {
            this.handleRequestShareMenuClose();
            this.props.handleTweetButtonClick(this.props.currentReview);
          }}
        >
          {I18n.t('share with twitter')}
        </MenuItem>
        <CopyToClipboard
          text={`${process.env.ENDPOINT}/maps/${
            this.props.currentReview.map_id
          }/reports/${this.props.currentReview.id}`}
          onCopy={this.props.handleUrlCopied}
          key="copy"
        >
          <MenuItem key="copy-link" onClick={this.handleRequestShareMenuClose}>
            {I18n.t('copy link')}
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
        <MenuItem
          key="issue"
          onClick={() => {
            this.handleRequestVertMenuClose();
            this.props.handleIssueButtonClick(this.props.currentUser, this.props.currentReview);
          }}
        >
          {I18n.t('issue')}
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
        {I18n.t('edit')}
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
        {I18n.t('copy')}
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
        {I18n.t('delete')}
      </MenuItem>
    );
  }
}

export default ReviewCard;
