'use client';

import {
  Box,
  Container,
  Link as MuiLink,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';

// Kept in step with Article 17 of the terms, which publishes the same address.
const SUPPORT_EMAIL = 'support@qoodish.com';

export default memo(function Footer() {
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  return (
    <Paper component="footer" square>
      <Box
        sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 3 }}
      >
        <Container>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1, sm: 3 }}
            useFlexGap
            sx={{ flexWrap: 'wrap' }}
          >
            <MuiLink
              href={localePath('/terms')}
              underline="hover"
              color="inherit"
              component={Link}
            >
              {dictionary['terms of service']}
            </MuiLink>
            <MuiLink
              href={localePath('/privacy')}
              underline="hover"
              color="inherit"
              component={Link}
            >
              {dictionary['privacy policy']}
            </MuiLink>
            <MuiLink
              href={`mailto:${SUPPORT_EMAIL}`}
              underline="hover"
              color="inherit"
            >
              {dictionary.contact}
            </MuiLink>
            <MuiLink
              href="https://github.com/yusuke-suzuki/qoodish-web"
              underline="hover"
              color="inherit"
              target="_blank"
              rel="noopener"
            >
              GitHub
            </MuiLink>
          </Stack>
        </Container>
      </Box>

      <Box
        sx={{ bgcolor: 'primary.dark', color: 'primary.contrastText', py: 2 }}
      >
        <Container>
          {/* A year read at render time disagrees between the UTC worker and a
              JST reader for the first nine hours of every January. */}
          <Typography variant="caption">
            © Qoodish, All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Paper>
  );
});
