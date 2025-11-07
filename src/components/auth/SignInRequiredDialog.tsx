import { Close } from '@mui/icons-material';
import {
  Container,
  Divider,
  Drawer,
  IconButton,
  Toolbar,
  Typography
} from '@mui/material';
import { memo, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import Logo from '../layouts/Logo';
import SignInButtons from './SignInButtons';

function SignInRequiredDialog() {
  const dictionary = useDictionary();
  const { signInRequired, setSignInRequired } = useContext(AuthContext);

  return (
    <Drawer
      open={signInRequired}
      anchor="bottom"
      onClose={() => setSignInRequired(false)}
      variant="temporary"
      slotProps={{
        paper: {
          sx: {
            zIndex: 1201
          }
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
      <Container maxWidth="md" sx={{ py: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          {dictionary.login}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {dictionary['this action requires sign in']}
        </Typography>

        <Container maxWidth="sm">
          <SignInButtons onSignInSuccess={() => setSignInRequired(false)} />
        </Container>
      </Container>
    </Drawer>
  );
}

export default memo(SignInRequiredDialog);
