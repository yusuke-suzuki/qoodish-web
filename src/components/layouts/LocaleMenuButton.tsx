'use client';

import { Check, Language } from '@mui/icons-material';
import {
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem
} from '@mui/material';
import Link from 'next/link';
import { memo, useState } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocaleLinks from '../../hooks/useLocaleLinks.ts';

type Props = {
  // The rail and the bar show icons alone, so the label has to live in a
  // tooltip there.
  variant: 'rail' | 'list' | 'bar';
  onNavigate?: () => void;
};

export default memo(function LocaleMenuButton({ variant, onNavigate }: Props) {
  const dictionary = useDictionary();
  const links = useLocaleLinks();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleSelect = () => {
    setAnchorEl(null);
    onNavigate?.();
  };

  return (
    <>
      {variant === 'bar' ? (
        <IconButton
          onClick={(event) => setAnchorEl(event.currentTarget)}
          title={dictionary.language}
          aria-label={dictionary.language}
        >
          <Language />
        </IconButton>
      ) : (
        <ListItemButton
          dense={variant === 'list'}
          onClick={(event) => setAnchorEl(event.currentTarget)}
          title={dictionary.language}
          sx={variant === 'rail' ? { justifyContent: 'center' } : undefined}
        >
          {variant === 'rail' ? (
            <ListItemIcon sx={{ minWidth: 0 }}>
              <Language />
            </ListItemIcon>
          ) : (
            <ListItemText
              primary={dictionary.language}
              slotProps={{ primary: { color: 'text.secondary' } }}
            />
          )}
        </ListItemButton>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {links.map((link) => (
          <MenuItem
            key={link.locale}
            selected={link.current}
            component={Link}
            href={link.href}
            hrefLang={link.locale}
            lang={link.locale}
            onClick={handleSelect}
          >
            <ListItemIcon>
              {link.current && <Check fontSize="small" />}
            </ListItemIcon>
            <ListItemText primary={link.label} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
});
