import { AddBox } from '@mui/icons-material';
import { Button } from '@mui/material';
import { memo, useContext } from 'react';
import ShellContext from '../../context/ShellContext.tsx';
import useDictionary from '../../hooks/useDictionary.ts';

export default memo(function CreateMapButton() {
  const dictionary = useDictionary();
  const { openCreateMap } = useContext(ShellContext);

  return (
    <Button
      variant="contained"
      color="secondary"
      disableElevation
      onClick={openCreateMap}
      startIcon={<AddBox />}
    >
      {dictionary['draw your first map']}
    </Button>
  );
});
