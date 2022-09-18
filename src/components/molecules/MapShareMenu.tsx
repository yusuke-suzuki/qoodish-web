import { useState, useCallback, memo, useMemo } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import CopyToClipboard from 'react-copy-to-clipboard';
import openToast from '../../actions/openToast';

import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon
} from 'react-share';
import {
  createStyles,
  IconButton,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
  Tooltip
} from '@material-ui/core';
import { FileCopy, Share } from '@material-ui/icons';
import { useLocale } from '../../hooks/useLocale';
import { useRouter } from 'next/router';
import { Map } from '@prisma/client';

const useStyles = makeStyles(() =>
  createStyles({
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
  })
);

type Props = {
  map: Map;
};

export default memo(function MapShareMenu(props: Props) {
  const { map } = props;

  const [anchorEl, setAnchorEl] = useState(undefined);
  const [menuOpen, setMenuOpen] = useState(false);

  const router = useRouter();
  const { I18n } = useLocale();

  const dispatch = useDispatch();

  const handleUrlCopied = useCallback(() => {
    dispatch(openToast(I18n.t('copied')));
  }, [dispatch]);

  const classes = useStyles();

  const basePath =
    router.locale === router.defaultLocale ? '' : `/${router.locale}`;
  const url = `${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}/maps/${map.id}`;

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
          <Share className={classes.mapMenuIcon} />
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
          className={classes.shareButton}
        >
          <FacebookShareButton url={url} className={classes.shareButton}>
            <ListItemIcon>
              <FacebookIcon round size={24} />
            </ListItemIcon>
            <ListItemText
              primary={I18n.t('share with facebook')}
              className={classes.listItemText}
            />
          </FacebookShareButton>
        </MenuItem>

        <MenuItem
          key="twitter"
          onClick={() => setMenuOpen(false)}
          className={classes.shareButton}
        >
          <TwitterShareButton
            url={url}
            title={map && map.name}
            className={classes.shareButton}
          >
            <ListItemIcon>
              <TwitterIcon round size={24} />
            </ListItemIcon>
            <ListItemText
              primary={I18n.t('share with twitter')}
              className={classes.listItemText}
            />
          </TwitterShareButton>
        </MenuItem>

        <CopyToClipboard text={url} onCopy={handleUrlCopied} key="copy">
          <MenuItem key="copy" onClick={() => setMenuOpen(false)}>
            <ListItemIcon>
              <FileCopy />
            </ListItemIcon>
            <ListItemText primary={I18n.t('copy link')} />
          </MenuItem>
        </CopyToClipboard>
      </Menu>
    </div>
  );
});
