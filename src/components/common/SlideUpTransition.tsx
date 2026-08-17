import { Slide, type SlideProps } from '@mui/material';
import type { Ref } from 'react';

export default function SlideUpTransition({
  ref,
  ...props
}: SlideProps & { ref?: Ref<unknown> }) {
  return <Slide direction="up" ref={ref} {...props} />;
}
