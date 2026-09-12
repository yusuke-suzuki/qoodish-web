'use client';

import {
  Box,
  Container,
  Link as MuiLink,
  Stack,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import Logo from './Logo.tsx';

// Kept in step with Article 17 of the terms, which publishes the same address.
const SUPPORT_EMAIL = 'support@qoodish.com';

export default memo(function Footer() {
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        py: { xs: 4, md: 6 }
      }}
    >
      <Container>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 3, md: 4 }}
          sx={{
            justifyContent: 'space-between',
            alignItems: { md: 'center' }
          }}
        >
          <Logo />

          {/* A row that wraps rather than a column below the breakpoint: four
              links stacked one per line filled a phone screen on their own. */}
          <Stack
            direction="row"
            useFlexGap
            sx={{
              flexWrap: 'wrap',
              columnGap: 3,
              rowGap: 1,
              color: 'text.secondary'
            }}
          >
            <MuiLink
              href={localePath('/terms')}
              underline="hover"
              color="inherit"
              variant="body2"
              component={Link}
            >
              {dictionary['terms of service']}
            </MuiLink>
            <MuiLink
              href={localePath('/privacy')}
              underline="hover"
              color="inherit"
              variant="body2"
              component={Link}
            >
              {dictionary['privacy policy']}
            </MuiLink>
            <MuiLink
              href={`mailto:${SUPPORT_EMAIL}`}
              underline="hover"
              color="inherit"
              variant="body2"
            >
              {dictionary.contact}
            </MuiLink>
            <MuiLink
              href="https://github.com/yusuke-suzuki/qoodish-web"
              underline="hover"
              color="inherit"
              variant="body2"
              target="_blank"
              rel="noopener"
            >
              GitHub
            </MuiLink>
          </Stack>
        </Stack>

        {/* A year read at render time disagrees between the UTC worker and a
            JST reader for the first nine hours of every January. */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: { xs: 3, md: 4 } }}
        >
          © Qoodish, All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
});
