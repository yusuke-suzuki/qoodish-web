import {
  Box,
  Container,
  Grid,
  Link as MuiLink,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import { amber } from '@mui/material/colors';
import Link from 'next/link';
import { memo } from 'react';
import useDictionary from '../../hooks/useDictionary';
import FbPage from './FbPage';

export default memo(function Footer() {
  const dictionary = useDictionary();

  return (
    <Paper square>
      <Box
        sx={{
          bgcolor: amber[500],
          p: 3
        }}
      >
        <Container>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
              <FbPage />
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
              <Stack>
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
                <MuiLink
                  href="https://github.com/yusuke-suzuki/qoodish-web"
                  underline="hover"
                  color="inherit"
                  title="GitHub"
                  target="_blank"
                >
                  GitHub
                </MuiLink>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Box
        sx={{
          bgcolor: amber[700],
          p: 2
        }}
      >
        <Container>
          <Typography variant="caption">
            © 2023 Qoodish, All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Paper>
  );
});
