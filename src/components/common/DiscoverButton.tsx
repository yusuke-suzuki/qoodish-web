import { Explore } from '@mui/icons-material';
import { Button } from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';

// The way out of an empty list: somewhere with maps to carry.
export default memo(function DiscoverButton() {
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  return (
    <Button
      variant="outlined"
      color="secondary"
      component={Link}
      href={localePath('/discover')}
      startIcon={<Explore />}
    >
      {dictionary['look around']}
    </Button>
  );
});
