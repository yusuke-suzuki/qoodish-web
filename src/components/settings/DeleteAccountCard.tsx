import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography
} from '@mui/material';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/router';
import { memo, useCallback, useContext, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import DeleteAccountDialog from './DeleteAccountDialog';

function DeleteAccountCard() {
  const dictionary = useDictionary();
  const { push } = useRouter();

  const { currentUser } = useContext(AuthContext);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleted = useCallback(async () => {
    const auth = getAuth();
    await signOut(auth);

    push('/login');
  }, [push]);

  return (
    <>
      <Card elevation={0}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom color="error">
            {dictionary['delete account']}
          </Typography>
          <Typography component="p" color="text.secondary">
            {dictionary['delete account detail']}
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            variant="outlined"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={!currentUser}
            color="error"
          >
            {dictionary.delete}
          </Button>
        </CardActions>
      </Card>

      <DeleteAccountDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDeleted={handleDeleted}
      />
    </>
  );
}

export default memo(DeleteAccountCard);
