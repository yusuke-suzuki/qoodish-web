'use client';

import { Close } from '@mui/icons-material';
import {
  Box,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useMediaQuery
} from '@mui/material';
import { memo, useContext } from 'react';
import AuthContext from '../../context/AuthContext.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import BottomSheet from '../common/BottomSheet.tsx';
import Logo from '../layouts/Logo.tsx';
import SignInButtons from './SignInButtons.tsx';

function SignInRequiredDialog() {
  const dictionary = useDictionary();
  const { signInRequired, setSignInRequired } = useContext(AuthContext);

  // A sheet is dismissed by dragging it, which is a gesture a pointer does not
  // have. Read after mount rather than on the server, which is safe here
  // because nothing of this renders until a reader asks for it.
  const pointer = useMediaQuery((theme) => theme.breakpoints.up('sm'));

  const handleOpen = () => setSignInRequired(true);

  const handleClose = () => setSignInRequired(false);

  const body = (
    <>
      <Typography variant="subtitle1" gutterBottom>
        {dictionary.login}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {dictionary['this action requires sign in']}
      </Typography>

      <SignInButtons onSignInSuccess={handleClose} />
    </>
  );

  if (pointer) {
    return (
      <Dialog open={signInRequired} onClose={handleClose} maxWidth="xs">
        {/* Not a heading: the mark names the site, and the dialog's own
            heading is below it. */}
        <DialogTitle
          component="div"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Logo />

          {/* The sheet says how to dismiss it with its puller; a dialog says
              it with this, the backdrop and the escape key being invisible. */}
          <IconButton
            edge="end"
            onClick={handleClose}
            title={dictionary.close}
            aria-label={dictionary.close}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>{body}</DialogContent>
      </Dialog>
    );
  }

  return (
    <BottomSheet
      open={signInRequired}
      onOpen={handleOpen}
      onClose={handleClose}
    >
      <Container maxWidth="sm" sx={{ overflowY: 'auto', pb: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Logo />
        </Box>

        {body}
      </Container>
    </BottomSheet>
  );
}

export default memo(SignInRequiredDialog);
