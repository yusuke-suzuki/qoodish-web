import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import { useLocale } from '../../hooks/useLocale';

const SharedLikeActions = props => {
  const { I18n } = useLocale();

  return (
    <Tooltip
      title={
        props.target && props.target.liked
          ? I18n.t('button unlike')
          : I18n.t('button like')
      }
    >
      <IconButton
        onClick={() => {
          props.target && props.target.liked
            ? props.handleUnlikeButtonClick()
            : props.handleLikeButtonClick();
        }}
        edge="end"
      >
        {props.target && props.target.liked ? (
          <FavoriteIcon color="error" />
        ) : (
          <FavoriteBorderIcon className={props.className} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default React.memo(SharedLikeActions);
