import EmailOutlined from '@mui/icons-material/EmailOutlined';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Typography
} from '@mui/material';
import { memo, useContext, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import ChangeEmailDialog from './ChangeEmailDialog';

function AccountEmailCard() {
  const dictionary = useDictionary();
  const { currentUser } = useContext(AuthContext);
  const [changeEmailDialogOpen, setChangeEmailDialogOpen] = useState(false);

  return (
    <>
      <Card elevation={0}>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            {dictionary['account email']}
          </Typography>
          <Typography component="p" color="text.secondary" gutterBottom>
            {dictionary['account email detail']}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <EmailOutlined fontSize="small" color="action" />
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ flex: 1 }}
            >
              {currentUser?.email ?? dictionary['not set']}
            </Typography>
          </Box>
        </CardContent>
        <CardActions>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={() => setChangeEmailDialogOpen(true)}
            disabled={!currentUser}
          >
            {dictionary['change email']}
          </Button>
        </CardActions>
      </Card>

      <ChangeEmailDialog
        open={changeEmailDialogOpen}
        onClose={() => setChangeEmailDialogOpen(false)}
      />
    </>
  );
}

export default memo(AccountEmailCard);
