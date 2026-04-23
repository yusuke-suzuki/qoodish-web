import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { AppMap } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import MapGridList from '../maps/MapGridList';

type Props = {
  maps?: AppMap[];
};

function RecommendMaps({ maps }: Props) {
  const dictionary = useDictionary();

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1" component="h2">
          {dictionary.recommend}
        </Typography>

        <Button
          size="small"
          color="secondary"
          LinkComponent={Link}
          href="/discover"
        >
          {dictionary['discover more']}
        </Button>
      </Box>

      <MapGridList maps={maps ?? []} skeletonSize={2} cols={1} />
    </>
  );
}

export default memo(RecommendMaps);
