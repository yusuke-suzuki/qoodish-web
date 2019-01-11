import React from 'react';
import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';
import PersonIcon from '@material-ui/icons/Person';
import Button from '@material-ui/core/Button';
import I18n from '../../../utils/I18n';
import ReviewLikeActions from '../ReviewLikeActions';

const styles = {
  root: {
    width: '100%'
  },
  actions: {
    display: 'flex',
    width: '100%',
    alignItems: 'center'
  },
  textField: {
    justifyContent: 'center',
    marginLeft: 16
  },
  commentActions: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  avatar: {
    width: 24,
    height: 24
  }
};

const UserAvatar = props => {
  if (props.currentUser.isAnonymous) {
    return (
      <Avatar style={styles.avatar}>
        <PersonIcon />
      </Avatar>
    );
  } else {
    return (
      <Avatar
        src={props.currentUser.thumbnail_url}
        alt={props.currentUser.name}
        style={styles.avatar}
      />
    );
  }
};

class ReviewCardActions extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      commentFormActive: false,
      comment: undefined
    };
    this.handleCommentFocus = this.handleCommentFocus.bind(this);
    this.handleCommentCancel = this.handleCommentCancel.bind(this);
    this.handleSendCommentButtonClick = this.handleSendCommentButtonClick.bind(
      this
    );
    this.handleCommentChange = this.handleCommentChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.sendingComment === true &&
      this.props.sendingComment === false
    ) {
      this.setState({
        commentFormActive: false
      });
    }
  }

  handleCommentFocus(e) {
    this.setState({
      commentFormActive: true
    });
  }

  handleCommentCancel(e) {
    this.setState({
      commentFormActive: false,
      comment: undefined
    });
  }

  handleSendCommentButtonClick() {
    let params = {
      comment: this.state.comment
    };
    this.props.handleSendCommentButtonClick(params, this.props.currentUser);
  }

  handleCommentChange(comment) {
    this.setState({
      comment: comment
    });
  }

  render() {
    return (
      <div style={styles.root}>
        <div style={styles.actions}>
          <UserAvatar {...this.props} />
          {this.renderCommentForm()}
          {!this.state.commentFormActive && (
            <ReviewLikeActions target={this.props.review} />
          )}
        </div>
        {this.state.commentFormActive && this.renderCommentActions()}
      </div>
    );
  }

  renderCommentForm() {
    return (
      <TextField
        fullWidth
        placeholder={I18n.t('add comment')}
        InputProps={{
          disableUnderline: true
        }}
        style={styles.textField}
        onFocus={this.handleCommentFocus}
        autoFocus={this.state.commentFormActive}
        multiline={this.state.commentFormActive}
        onChange={e => this.handleCommentChange(e.target.value)}
      />
    );
  }

  renderCommentActions() {
    return (
      <div style={styles.commentActions}>
        <Button onClick={this.handleCommentCancel}>{I18n.t('cancel')}</Button>
        <Button
          onClick={this.handleSendCommentButtonClick}
          color="primary"
          disabled={!this.state.comment || this.props.sendingComment}
        >
          {I18n.t('post')}
        </Button>
      </div>
    );
  }
}

export default ReviewCardActions;
