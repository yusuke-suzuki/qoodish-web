import { Box } from '@mui/material';

export default function DrawerPuller() {
  return (
    <Box
      sx={{
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'center',
        py: 1
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 4,
          borderRadius: 2,
          bgcolor: 'divider'
        }}
      />
    </Box>
  );
}
