import React, { Component } from 'react';
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

const styles = {
  cardLarge: {
    marginBottom: 20
  },
  cardSmall: {
    marginBottom: 0
  },
  mapName: {
    cursor: 'pointer'
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
      <div>
        {this.renderReviewCard(this.props.currentReview)}
      </div>
    );
  }

  renderReviewCard(review) {
    return (
      <Card style={this.props.large ? styles.cardLarge : styles.cardSmall}>
        <CardHeader
          avatar={
            <Avatar>
              <img src={review.author.profile_image_url} alt={review.author.name} style={styles.profileImage} />
            </Avatar>
          }
          title={review.author.name}
          subheader={this.fromNow(review)}
        />
        <CardContent style={styles.cardContent}>
          <Typography style={styles.mapName} type='subheading' color='secondary' gutterBottom onClick={this.props.handleMapClick}>
            {review.map_name}
          </Typography>
          <Typography type='headline' component='h2' gutterBottom>
            {review.spot.name}
          </Typography>
          <Typography component='p'>
            {review.comment}
          </Typography>
        </CardContent>
        {review.image ? this.renderCardMedia(review) : null}
        <CardActions disableActionSpacing>
          {this.renderShareButton()}
          {this.renderShareMenu()}
          {this.renderMoreVertButton()}
          {this.props.currentReview.editable ? this.renderMoreVertMenuForEdit() : this.renderMoreVertMenu()}
        </CardActions>
      </Card>
    );
  }

  fromNow(review) {
    return moment(review.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ').locale(window.currentLocale).fromNow();
  }

  renderCardMedia(review) {
    return (
      <CardMedia style={styles.cardMedia}>
        <img src={review.image.url} style={styles.media} />
      </CardMedia>
    );
  }

  renderShareButton() {
    return (
      <IconButton
        color='contrast'
        aria-label='More share'
        aria-owns={this.state.shareMenuOpen ? 'share-menu' : null}
        aria-haspopup='true'
        onClick={this.handleShareButtonClick}
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
        onRequestClose={this.handleRequestShareMenuClose}
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
            Copy link to this report
          </MenuItem>
        </CopyToClipboard>
      </Menu>
    );
  }

  renderMoreVertButton() {
    return (
      <IconButton
        color='contrast'
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
      <Menu
        id='vert-menu'
        anchorEl={this.state.anchorElVert}
        open={this.state.vertMenuOpen}
        onRequestClose={this.handleRequestVertMenuClose}
      >
        {this.props.currentReview.editable ? this.renderEditButton() : null}
        {this.props.currentReview.editable ? this.renderDeleteButton() : null}
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

  renderMoreVertMenu() {
    return (
      <Menu
        id='vert-menu'
        anchorEl={this.state.anchorElVert}
        open={this.state.vertMenuOpen}
        onRequestClose={this.handleRequestVertMenuClose}
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

  renderMoreVertMenuForEdit() {
    return (
      <Menu
        id='vert-menu'
        anchorEl={this.state.anchorElVert}
        open={this.state.vertMenuOpen}
        onRequestClose={this.handleRequestVertMenuClose}
      >
        {this.renderEditButton()}
        {this.renderDeleteButton()}
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
}

export default ReviewCard;
