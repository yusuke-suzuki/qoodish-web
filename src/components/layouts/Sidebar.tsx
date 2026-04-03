'use client';

import {
  CardContent,
  Divider,
  Link as MuiLink,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { AppMap } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import FbPage from './FbPage';
import RecommendMaps from './RecommendMaps';
import TrendingMaps from './TrendingMaps';

type Props = {
  popularMaps?: AppMap[];
};

function Sidebar({ popularMaps }: Props) {
  const dictionary = useDictionary();

  return (
    <Stack spacing={2}>
      <RecommendMaps />

      <Divider />

      <TrendingMaps maps={popularMaps} />

      <Paper elevation={0}>
        <CardContent>
          <Stack spacing={1}>
            <MuiLink
              href="/terms"
              underline="hover"
              color="inherit"
              component={Link}
              title={dictionary['terms of service']}
            >
              {dictionary['terms of service']}
            </MuiLink>
            <MuiLink
              href="/privacy"
              underline="hover"
              color="inherit"
              component={Link}
              title={dictionary['privacy policy']}
            >
              {dictionary['privacy policy']}
            </MuiLink>
            <Typography variant="caption">
              © 2023 Qoodish, All rights reserved.
            </Typography>
          </Stack>
        </CardContent>
      </Paper>

      <FbPage />
    </Stack>
  );
}

export default memo(Sidebar);
