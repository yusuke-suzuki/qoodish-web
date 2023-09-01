import { Close, ExitToApp } from '@mui/icons-material';
import {
  Button,
  Container,
  Divider,
  Drawer,
  Grid,
  IconButton,
  Toolbar,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { memo, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import Logo from '../layouts/Logo';

function SignInRequiredDialog() {
  const dictionary = useDictionary();

  const { signInRequired, setSignInRequired } = useContext(AuthContext);

  return (
    <Drawer
      open={signInRequired}
      anchor="bottom"
      onClose={() => setSignInRequired(false)}
      variant="persistent"
      PaperProps={{
        sx: {
          zIndex: 1201
        }
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Logo />

        <IconButton onClick={() => setSignInRequired(false)} edge="end">
          <Close />
        </IconButton>
      </Toolbar>

      <Divider />

      <Container sx={{ py: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          {dictionary.login}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {dictionary['this action requires sign in']}
        </Typography>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Link href="/login" passHref>
              <Button
                color="secondary"
                variant="contained"
                startIcon={<ExitToApp />}
                fullWidth
              >
                {dictionary.login}
              </Button>
            </Link>
          </Grid>

          <Grid item xs={12} md={6}>
            <Button
              onClick={() => setSignInRequired(false)}
              variant="outlined"
              fullWidth
              color="secondary"
            >
              {dictionary.cancel}
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Drawer>
  );
}

export default memo(SignInRequiredDialog);
