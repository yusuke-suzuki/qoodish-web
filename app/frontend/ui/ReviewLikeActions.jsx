import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import Button from '@material-ui/core/Button';

const styles = {
  container: {
    display: 'flex'
  },
  likesButton: {
    minWidth: 'auto'
  }
};

const LikeButton = (props) => {
  return (
    <IconButton
      onClick={() => {
        props.review.liked
          ? props.handleUnlikeButtonClick()
          : props.handleLikeButtonClick(props.currentUser)
      }}
    >
      {props.review.liked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
    </IconButton>
  );
};

const LikesBadge = (props) => {
  return (
    <Button
      size="small"
      onClick={props.handleLikesClick}
      style={styles.likesButton}
    >
      {props.review.likes_count}
    </Button>
  );
};

const ReviewLikeActions = (props) => {
  return (
    <div style={styles.container}>
      <LikeButton {...props} />
      {props.review.likes_count > 0 && <LikesBadge {...props} />}
    </div>
  );
};

export default ReviewLikeActions;
