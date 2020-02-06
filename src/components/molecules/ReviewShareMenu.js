import React, { useState, useCallback } from 'react';
import { useDispatch } from 'redux-react-hook';

import ShareIcon from '@material-ui/icons/Share';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import CopyToClipboard from 'react-copy-to-clipboard';
import I18n from '../../utils/I18n';

import openToast from '../../actions/openToast';

import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon
} from 'react-share';

const styles = {
  shareButton: {
    display: 'flex',
    outline: 'none',
    alignItems: 'center',
    width: '100%'
  },
  listItemText: {
    flex: 'none'
  }
};

const shareUrl = review => {
  return review
    ? `${process.env.ENDPOINT}/maps/${review.map.id}/reports/${review.id}`
    : '';
};

const ReviewShareMenu = props => {
  const [anchorEl, setAnchorEl] = useState(undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const review = props.currentReview;
  const dispatch = useDispatch();

  const handleUrlCopied = useCallback(() => {
    dispatch(openToast(I18n.t('copied')));
  });

  return (
    <div>
      <IconButton
        aria-label="More share"
        aria-owns={menuOpen ? 'share-menu' : null}
        aria-haspopup="true"
        onClick={e => {
          setAnchorEl(e.currentTarget);
          setMenuOpen(true);
        }}
      >
        <ShareIcon />
      </IconButton>

      <Menu
        id="share-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      >
        <FacebookShareButton url={shareUrl(review)} style={styles.shareButton}>
          <MenuItem
            key="facebook"
            onClick={() => setMenuOpen(false)}
            style={styles.shareButton}
          >
            <ListItemIcon>
              <FacebookIcon round size={24} />
            </ListItemIcon>
            <ListItemText
              primary={I18n.t('share with facebook')}
              style={styles.listItemText}
            />
          </MenuItem>
        </FacebookShareButton>

        <TwitterShareButton
          hashtags={[]}
          url={shareUrl(review)}
          title={`${review.spot.name} - ${review.map.name}`}
          style={styles.shareButton}
        >
          <MenuItem
            key="twitter"
            onClick={() => setMenuOpen(false)}
            style={styles.shareButton}
          >
            <ListItemIcon>
              <TwitterIcon round size={24} />
            </ListItemIcon>
            <ListItemText
              primary={I18n.t('share with twitter')}
              style={styles.listItemText}
            />
          </MenuItem>
        </TwitterShareButton>

        <CopyToClipboard
          text={shareUrl(review)}
          onCopy={handleUrlCopied}
          key="copy"
        >
          <MenuItem key="copy" onClick={() => setMenuOpen(false)}>
            <ListItemIcon>
              <FileCopyIcon />
            </ListItemIcon>
            <ListItemText primary={I18n.t('copy link')} />
          </MenuItem>
        </CopyToClipboard>
      </Menu>
    </div>
  );
};

export default React.memo(ReviewShareMenu);
