'use client';

import { createContext } from 'react';

type ShellContextType = {
  openSearch: () => void;
  openCreateMap: () => void;
  appBarHidden: boolean;
  setAppBarHidden: (hidden: boolean) => void;
};

const ShellContext = createContext<ShellContextType>({
  openSearch: () => {},
  openCreateMap: () => {},
  appBarHidden: false,
  setAppBarHidden: () => {}
});

export default ShellContext;
