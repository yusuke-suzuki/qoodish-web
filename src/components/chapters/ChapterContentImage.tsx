import { Box } from '@mui/material';
import type { Ref } from 'react';

type Props = {
  src: string;
  selected?: boolean;
  ref?: Ref<HTMLImageElement>;
};

export default function ChapterContentImage({
  src,
  selected = false,
  ref
}: Props) {
  return (
    <Box sx={{ my: 2 }}>
      <Box
        component="img"
        ref={ref}
        src={src}
        alt=""
        sx={{
          display: 'block',
          width: '100%',
          borderRadius: 1,
          outline: selected ? '2px solid' : 'none',
          outlineColor: 'primary.main',
          outlineOffset: '2px'
        }}
      />
    </Box>
  );
}
