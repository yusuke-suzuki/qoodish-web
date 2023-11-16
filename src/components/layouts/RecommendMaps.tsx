import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import useDictionary from '../../hooks/useDictionary';
import { useRecommendMaps } from '../../hooks/useRecommendMaps';
import MapGridList from '../maps/MapGridList';

function RecommendMaps() {
  const { maps } = useRecommendMaps();

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

      <MapGridList maps={maps} skeletonSize={2} cols={1} />
    </>
  );
}

export default memo(RecommendMaps);
