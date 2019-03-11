import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';

const SharedLikeActions = props => {
  return (
    <IconButton
      onClick={() => {
        props.target && props.target.liked
          ? props.handleUnlikeButtonClick()
          : props.handleLikeButtonClick();
      }}
    >
      {props.target && props.target.liked ? (
        <FavoriteIcon color="error" />
      ) : (
        <FavoriteBorderIcon />
      )}
    </IconButton>
  );
};

export default React.memo(SharedLikeActions);
