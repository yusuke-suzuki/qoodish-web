import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import Badge from '@material-ui/core/Badge';

const styles = {
  likesCount: {
    cursor: 'pointer',
    marginLeft: 5
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
}

const LikesBadge = (props) => {
  return (
    <Badge
      badgeContent={props.review.likes_count}
      color="default"
      onClick={props.handleLikesClick}
      style={styles.likesCount}
    >
      <div />
    </Badge>
  );
}

const ReviewCardActions = (props) => {
  return (
    <div>
      <LikeButton {...props} />
      {props.review.likes_count > 0 && <LikesBadge {...props} />}
    </div>
  );
};

export default ReviewCardActions;
