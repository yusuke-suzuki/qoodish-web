'use client';

import { createContext } from 'react';

type ShellContextType = {
  openSearch: () => void;
  openCreateMap: () => void;
};

const ShellContext = createContext<ShellContextType>({
  openSearch: () => {},
  openCreateMap: () => {}
});

export default ShellContext;
