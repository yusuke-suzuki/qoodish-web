import {
  ArrowForward,
  Delete,
  Edit,
  Link as LinkIcon,
  MoreVert,
  ReportProblem
} from '@mui/icons-material';
import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { memo, useRef, useState } from 'react';
import type { Pin, Profile } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import { localePath } from '../../utils/locales.ts';
import { SITE_ORIGIN } from '../../utils/metadata.ts';

type Props = {
  pin: Pin | null;
  currentProfile?: Profile | null;
  onEditClick?: (pin: Pin) => void;
  onDeleteClick?: (pin: Pin) => void;
  onReportClick: (pin: Pin) => void;
  hideDetail?: boolean;
};

export default memo(function PinMenuButton({
  pin,
  currentProfile,
  onEditClick,
  onDeleteClick,
  onReportClick,
  hideDetail
}: Props) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const { push } = useRouter();
  const { lang } = useParams<{ lang: string }>();
  const dictionary = useDictionary();

  const isAuthor = currentProfile?.id === pin?.author.id;

  const pinPath = `/pins/${pin?.id}`;
  const url = `${SITE_ORIGIN}${localePath(lang, pinPath)}`;

  const handleCopyClick = async () => {
    if (!url) {
      return;
    }

    setAnchorEl(null);

    await navigator.clipboard.writeText(url);

    enqueueSnackbar(dictionary.copied);
  };

  const handleReportClick = () => {
    setAnchorEl(null);

    onReportClick(pin);
  };

  const handleEditClick = () => {
    setAnchorEl(null);

    onEditClick(pin);
  };

  const handleDeleteClick = () => {
    setAnchorEl(null);

    onDeleteClick(pin);
  };

  const handleDetailClick = () => {
    setAnchorEl(null);

    push(localePath(lang, pinPath));
  };

  return (
    <>
      <IconButton
        ref={buttonRef}
        onClick={() => setAnchorEl(buttonRef.current)}
        title={dictionary.more}
        aria-label={dictionary.more}
      >
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={handleCopyClick}>
          <ListItemIcon>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={dictionary['copy link']} />
        </MenuItem>
        {hideDetail ? null : (
          <MenuItem onClick={handleDetailClick}>
            <ListItemIcon>
              <ArrowForward fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={dictionary.detail} />
          </MenuItem>
        )}
        {!isAuthor && (
          <MenuItem onClick={handleReportClick}>
            <ListItemIcon>
              <ReportProblem fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={dictionary['report content']} />
          </MenuItem>
        )}
        {isAuthor && <Divider />}
        {onEditClick && isAuthor && (
          <MenuItem onClick={handleEditClick}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={dictionary.edit} />
          </MenuItem>
        )}
        {onDeleteClick && isAuthor && (
          <MenuItem onClick={handleDeleteClick}>
            <ListItemIcon>
              <Delete color="error" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={dictionary.delete}
              slotProps={{
                primary: {
                  color: 'error'
                }
              }}
            />
          </MenuItem>
        )}
      </Menu>
    </>
  );
});
