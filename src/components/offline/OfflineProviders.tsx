'use client';

import { CssBaseline, ThemeProvider } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { type ReactNode, useMemo } from 'react';
import { createAppTheme } from '../../utils/theme.ts';

type Props = {
  children: ReactNode;
  lang: string;
};

export default function OfflineProviders({ children, lang }: Props) {
  const theme = useMemo(() => createAppTheme(lang), [lang]);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
