import { Icon, Stack, Typography, useTheme } from '@mui/material';
import { type ElementType, memo, type ReactNode } from 'react';

type Props = {
  icon: ElementType;
  message: string;
  action?: ReactNode;
};

export default memo(function NoContents({ icon, message, action }: Props) {
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

      {action && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}
        >
          {action}
        </Stack>
      )}
    </Stack>
  );
});
