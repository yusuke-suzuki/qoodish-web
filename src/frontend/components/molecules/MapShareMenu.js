import React, { useState, useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';

import Tooltip from '@material-ui/core/Tooltip';
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
  mapMenuIcon: {
    color: 'white'
  },
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

const shareUrl = map => {
  return map ? `${process.env.ENDPOINT}/maps/${map.id}` : '';
};

const MapShareMenu = () => {
  const [anchorEl, setAnchorEl] = useState(undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const map = useMappedState(
    useCallback(state => state.mapSummary.currentMap, [])
  );
  const dispatch = useDispatch();

  const handleUrlCopied = useCallback(() => {
    dispatch(openToast(I18n.t('copied')));
  });

  return (
    <div>
      <Tooltip title={I18n.t('button share')}>
        <IconButton
          aria-label="More share"
          aria-owns={menuOpen ? 'share-menu' : null}
          aria-haspopup="true"
          onClick={e => {
            setAnchorEl(e.currentTarget);
            setMenuOpen(true);
          }}
        >
          <ShareIcon style={styles.mapMenuIcon} />
        </IconButton>
      </Tooltip>

      <Menu
        id="share-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      >
        <MenuItem
          key="facebook"
          onClick={() => setMenuOpen(false)}
          style={styles.shareButton}
        >
          <FacebookShareButton url={shareUrl(map)} style={styles.shareButton}>
            <ListItemIcon>
              <FacebookIcon round size={24} />
            </ListItemIcon>
            <ListItemText primary={I18n.t('share with facebook')} style={styles.listItemText} />
          </FacebookShareButton>
        </MenuItem>

        <MenuItem
          key="twitter"
          onClick={() => setMenuOpen(false)}
          style={styles.shareButton}
        >
          <TwitterShareButton
            url={shareUrl(map)}
            title={map && map.name}
            style={styles.shareButton}
          >
            <ListItemIcon>
              <TwitterIcon round size={24} />
            </ListItemIcon>
            <ListItemText primary={I18n.t('share with twitter')} style={styles.listItemText} />
          </TwitterShareButton>
        </MenuItem>

        <CopyToClipboard
          text={shareUrl(map)}
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

export default React.memo(MapShareMenu);
