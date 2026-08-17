import { Container, Typography } from '@mui/material';
import { memo, useCallback, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import BottomSheet from '../common/BottomSheet';
import Logo from '../layouts/Logo';
import SignInButtons from './SignInButtons';

function SignInRequiredDialog() {
  const dictionary = useDictionary();
  const { signInRequired, setSignInRequired } = useContext(AuthContext);

  const handleOpen = useCallback(
    () => setSignInRequired(true),
    [setSignInRequired]
  );

  const handleClose = useCallback(
    () => setSignInRequired(false),
    [setSignInRequired]
  );

  return (
    <BottomSheet
      open={signInRequired}
      onOpen={handleOpen}
      onClose={handleClose}
    >
      <Container maxWidth="md" sx={{ overflowY: 'auto', pb: 3 }}>
        <Logo />

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          {dictionary.login}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {dictionary['this action requires sign in']}
        </Typography>

        <Container maxWidth="sm" disableGutters>
          <SignInButtons onSignInSuccess={handleClose} />
        </Container>
      </Container>
    </BottomSheet>
  );
}

export default memo(SignInRequiredDialog);
