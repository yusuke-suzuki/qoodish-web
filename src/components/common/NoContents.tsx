import { Icon, Stack, Typography, useTheme } from '@mui/material';
import { type ElementType, memo } from 'react';

type Props = {
  icon: ElementType;
  message: string;
};

export default memo(function NoContents({ icon, message }: Props) {
  const theme = useTheme();

  return (
    <Stack
      spacing={2}
      sx={{
        alignItems: 'center',
        color: 'text.disabled',
        p: 2
      }}
    >
      <Icon
        sx={{
          width: theme.spacing(12),
          height: theme.spacing(12)
        }}
        component={icon}
      />

      <Typography variant="body2" align="center">
        {message}
      </Typography>
    </Stack>
  );
});
