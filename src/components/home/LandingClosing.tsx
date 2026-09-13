'use client';

import { Button, Container, Divider, Stack } from '@mui/material';
import Link from 'next/link';
import { memo, useContext } from 'react';
import AuthContext from '../../context/AuthContext.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import LandingSection from './LandingSection.tsx';

export default memo(function LandingClosing() {
  const { setSignInRequired } = useContext(AuthContext);
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  return (
    <>
      <Container maxWidth="lg">
        <Divider />
      </Container>

      <LandingSection>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="center"
          justifyContent="center"
        >
          <Button
            variant="contained"
            size="large"
            disableElevation
            onClick={() => setSignInRequired(true)}
            sx={{ borderRadius: 999, px: 4, py: 1.25 }}
          >
            {dictionary['get started']}
          </Button>

          <Button
            variant="outlined"
            size="large"
            component={Link}
            href={localePath('/discover')}
            sx={{ borderRadius: 999, px: 4, py: 1.25 }}
          >
            {dictionary.discover}
          </Button>
        </Stack>
      </LandingSection>
    </>
  );
});
