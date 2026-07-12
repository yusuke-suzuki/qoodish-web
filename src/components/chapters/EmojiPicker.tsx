'use client';

import { Box, ButtonBase, Popover } from '@mui/material';
import { memo } from 'react';

const EMOJIS = [
  '😀',
  '😄',
  '🥰',
  '😎',
  '🤔',
  '😮',
  '🥲',
  '😴',
  '🎉',
  '✨',
  '🔥',
  '💯',
  '❤️',
  '👍',
  '🙏',
  '💪',
  '🚶',
  '🏃',
  '🚴',
  '🚗',
  '🚃',
  '✈️',
  '⛺',
  '🎒',
  '🏔️',
  '🗻',
  '🌊',
  '🌅',
  '🌸',
  '🍁',
  '☀️',
  '🌧️',
  '📷',
  '🗺️',
  '📍',
  '🏁',
  '⛩️',
  '🏰',
  '♨️',
  '🎡',
  '🍜',
  '🍣',
  '🍙',
  '🍰',
  '🍺',
  '☕',
  '🍦',
  '🥟'
];

type Props = {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onSelect: (emoji: string) => void;
};

function EmojiPicker({ anchorEl, onClose, onSelect }: Props) {
  return (
    <Popover
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          p: 1
        }}
      >
        {EMOJIS.map((emoji) => (
          <ButtonBase
            key={emoji}
            onClick={() => onSelect(emoji)}
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              fontSize: 22
            }}
          >
            {emoji}
          </ButtonBase>
        ))}
      </Box>
    </Popover>
  );
}

export default memo(EmojiPicker);
