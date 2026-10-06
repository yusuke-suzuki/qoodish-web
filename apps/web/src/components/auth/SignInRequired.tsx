'use client';

import { Login } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Typography
} from '@mui/material';
import { memo, useContext } from 'react';
import AuthContext from '../../context/AuthContext.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import LoadingStatus from '../common/LoadingStatus.tsx';

type Props = {
  title: string;
};

// Rendered where a page needs an account the server did not see. The client
// may still be exchanging its refresh token, in which case the page refreshes
// itself once it has one, so nothing is asked of the reader until that has
// settled.
function SignInRequired({ title }: Props) {
  const { authenticated, isLoading, setSignInRequired } =
    useContext(AuthContext);
  const dictionary = useDictionary();

  if (authenticated || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <LoadingStatus loading />
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h1" gutterBottom>
          {title}
        </Typography>
        <Typography color="text.secondary">
          {dictionary['sign in to continue']}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          color="primary"
          disableElevation
          startIcon={<Login />}
          onClick={() => setSignInRequired(true)}
        >
          {dictionary.login}
        </Button>
      </CardActions>
    </Card>
  );
}

export default memo(SignInRequired);
